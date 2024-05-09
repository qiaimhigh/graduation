import axios from "axios";
const schedule = require("node-schedule");

const db = require("../../mysql/mysql");
const QRCode = require("qrcode");
const dayjs = require("dayjs");
const { exportExcel } = require("../../utils/exceljs");
const { deviceExcel, repairDeviceExcel } = require("./config");

/**
 * 获取设备列表
 * 1、添加根绝deviceID模糊搜索功能
 */
const getDeviceList = (req, res) => {
  // console.log(req.query);
  // 分页查询
  const curPage = parseInt(req.query.curPage, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const { deviceID } = req.query;
  // 参数数组---或许只有会增加 根据其他参数去查询
  const queryParams = [];

  if (curPage < 1 || pageSize < 1) {
    return res.send({
      code: 400,
      msg: "查询参数错误",
    });
  }

  try {
    // 查询总数
    let totalSql = "SELECT COUNT(*) AS total FROM idevice";
    // 计算分页查询的起点
    const offset = (curPage - 1) * pageSize;

    if (deviceID) {
      totalSql += " where deviceID like ?";
      queryParams.push(`%${deviceID}%`);
    }

    db.query(totalSql, queryParams, (err, result) => {
      if (err) {
        res.send({
          code: 400,
          msg: err,
        });
      } else {
        const total = result[0].total;
        const totalPages = Math.ceil(total / pageSize);

        let sql = "select * from idevice";
        if (deviceID) {
          sql += " where deviceID like ?";
        }
        sql += " limit ?,?";
        queryParams.push(offset, pageSize);

        db.query(sql, queryParams, (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).send({
              code: 500,
              msg: "服务异常请稍后重试",
            });
          } else if (result && result?.length > 0) {
            const deviceList = result.map((item) => ({
              ...item,
              qrcode: item.qrcode ? item.qrcode.toString("utf8") : "",
            }));
            res.send({
              code: 200,
              msg: "获取设备列表成功",
              data: {
                curPage,
                total,
                totalPages,
                deviceList,
                pageSize,
              },
            });
          } else {
            res.send({
              code: 400,
              msg: "数据不存在",
            });
          }
        });
      }
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: err || "未知错误",
    });
  }
};

/**
 * 生成二维码
 * 使用设备信息（deviceID-设备编号 、 id-设备ID、 ）生成二维码
 */
const generateQrcode = (req, res) => {
  // console.log(req.body);
  const { deviceID, id, deviceName } = req.body;
  try {
    // 检查是否已经存在二维码， 每个设备只能生成一次二维码
    const checkSql =
      "SELECT qrcode IS NOT NULL AS HasQRCode FROM idevice WHERE deviceID = ?";
    db.query(checkSql, [deviceID], (err, results) => {
      if (err) {
        console.log("qrcode", err);
        res.send({
          code: 400,
          msg: err,
        });
      } else if (results.length > 0 && results[0].HasQRCode) {
        res.send({
          code: 301,
          msg: "已存在设备二维码，请勿重新生成",
        });
      } else {
        // qrcode 只允许使用字符串生成二维码
        QRCode.toDataURL(JSON.stringify({ deviceID, id, deviceName }))
          .then((url) => {
            if (url) {
              const sql = "UPDATE idevice SET qrcode = ? WHERE deviceID = ?";
              db.query(sql, [url, deviceID], (err, result) => {
                if (err) {
                  console.log("sql 更新失败", err);
                  res.send({
                    code: 400,
                    msg: "生成qrcode失败",
                  });
                } else {
                  console.log("update sql 返回结果", result);
                  return res.send({
                    code: 200,
                    msg: "生成二维码成功",
                  });
                }
              });
            } else {
              res.send({
                code: 400,
                msg: "生成qrcode失败",
              });
            }
          })
          .catch((error) => {
            console.log("生成qrcode错误", error);
            res.send({
              code: 400,
              msg: error || "生成qrcode失败",
            });
          });
      }
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: err || "未知错误",
    });
  }
};

/**
 * 获取accessToken
 */
async function getAccessToken() {
  const appId = "wx7470a565953732cb"; // 微信小程序appId
  const appSecret = "53e5aa485ee0d2d1df9d76b2c00352b3"; // 小程序appSecret
  const response = await axios.get(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
  );

  if (response.data && response.data.access_token) {
    console.log(response.data.access_token, "--");
    console.log(response.data, "---==");
    return response.data.access_token;
  } else {
    // TODO: 添加错误处理方式
    console.log("获取失败");
  }
}

/**
 * 订阅微信消息
 *
 */
const sendMsg = async (touser, deviceID, location, name, studentID) => {
  const curTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  let data = {
    thing1: {
      value: name || "未知设备",
    },
    character_string2: {
      value: deviceID || "XUPTD8888888",
    },
    thing3: {
      value: location || "FZ303",
    },
    time4: {
      value: curTime || "-",
    },
  };
  let access_token = await getAccessToken(); // 这是你的功能函数，用于获取微信公众平台的access_token
  let response = await axios.post(
    `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,
    {
      touser,
      template_id: "7GfeBDc1FF1V9dsMnxdNdC_bH2hQBGdsM3ELSp0kquQ",
      data,
    }
  );
  // 设置定时任务在十分钟后执行
  var date = new Date(Date.now() + 10 * 60 * 1000); // 十分钟后
  // 测试使用
  autoCheckOut(deviceID, studentID);
  // schedule.scheduleJob(date, function () {
  //   checkOutDevice(req, res);
  // });

  console.log("sendMsg", response.data);
};

/**
 * 扫码签到
 * 根据deviceID、id唯一标识签到当前的设备
 * isUsing-是否正在使用 、isCheckIn-是否签到、 username - 用户账号，用来记录当前的设备的使用者
 */
const checkInDevice = (req, res) => {
  // console.log(req)
  const { deviceID, username = "0402033", deviceName, code } = req.body;

  axios
    .get("https://api.weixin.qq.com/sns/jscode2session", {
      params: {
        appid: "wx7470a565953732cb",
        secret: "53e5aa485ee0d2d1df9d76b2c00352b3",
        js_code: code,
        grant_type: "authorization_code",
      },
    })
    .then((response) => {
      const { openid } = response.data;
      console.log("得到的openid:", openid);
      try {
        db.getConnection(function (err, db) {
          const checkSql = "select * from idevice where deviceID = ?";
          db.query(checkSql, [deviceID], (err, results) => {
            if (err) {
              res.send({
                code: 400,
                msg: err,
              });
            } else {
              // 判断当前的设备是否在使用中
              if (results && results.length > 0) {
                const { isUsing, isCheckIn, deviceLocation, deviceName } =
                  results[0];
                console.log(isCheckIn, isUsing);
                if (isCheckIn || isUsing) {
                  res.send({
                    code: 400,
                    msg: "设备正在使用中",
                  });
                } else {
                  // 事务
                  db.beginTransaction((err) => {
                    if (err) {
                      res.send({
                        code: 400,
                        err: "error",
                      });
                    } else {
                      const sql =
                        "UPDATE idevice SET isUsing = 1, isCheckIn = 1, usingPerson = ? WHERE deviceID = ?";
                      db.query(sql, [username, deviceID], (err, results) => {
                        if (err) {
                          db.rollback(function () {
                            res.send({
                              code: 400,
                              msg: "签到失败",
                            });
                          });
                        } else {
                          // console.log(results)
                          const sql2 = `
                                                            INSERT INTO records 
                                                            (deviceID, studentID, startTime, isCheckout, deviceName) 
                                                            VALUES 
                                                            (?, ?, ?, 0, ?)
                                                        `;
                          const nowTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
                          db.query(
                            sql2,
                            [deviceID, username, nowTime, deviceName],
                            (err, results) => {
                              if (err) {
                                db.rollback(function () {
                                  res.send({
                                    code: 400,
                                    msg: "签到失败",
                                  });
                                });
                              } else {
                                db.commit(function (err) {
                                  if (err) {
                                    return db.rollback(function () {
                                      res.send({
                                        code: 400,
                                        msg: "签到失败",
                                      });
                                    });
                                  } else {
                                    console.log("开始推送消息");
                                    const date = new Date(
                                      Date.now() + 2 * 60 * 60 * 1000
                                    ); // 两小时后
                                    sendMsg(
                                      openid,
                                      deviceID,
                                      deviceLocation,
                                      deviceName,
                                      username
                                    );
                                    // 演示两小时后的定时任务
                                    // schedule.scheduleJob(date, function () {
                                    //   sendMsg(openid);
                                    // });
                                    res.send({
                                      code: 200,
                                      msg: "签到成功！",
                                    });
                                    db.release();
                                  }
                                });
                              }
                            }
                          );
                        }
                      });
                    }
                  });
                }
              } else {
                res.send({
                  code: 400,
                  msg: "设备不存在，无法签到",
                });
              }
            }
          });
        });
      } catch (err) {
        res.status(500).send({
          code: 500,
          msg: err || "未知错误",
        });
      }
    })
    .catch(() => {});
};

/**
 * 签退
 * 需要根据当前的用户名和传入的用户名进行判断，确定是否可以签退
 * 签退时不需要进行usingPerson的修改，因为签到的时候会更新当前usingPerson（此处也可以留作上一个使用者的溯源）
 */
const checkOutDevice = (req, res) => {
  // console.log(req.body);
  const { deviceID, username = "0402033" } = req.body;
  try {
    db.getConnection((err, db) => {
      if (err) {
        res.send({
          code: 400,
          msg: err,
        });
      } else {
        const checkSql =
          "SELECT usingPerson, isUsing, isCheckIn FROM idevice WHERE deviceID = ?";
        db.query(checkSql, [deviceID], (err, results) => {
          if (err) {
            res.send({
              code: 400,
              msg: err,
            });
          } else {
            if (results && results.length > 0) {
              const { usingPerson, isUsing, isCheckIn } = results[0];
              if (isUsing === 0 || isCheckIn === 0) {
                res.send({
                  code: 400,
                  msg: "设备未在使用",
                });
              } else if (usingPerson !== username) {
                res.send({
                  code: 400,
                  msg: "此设备他人正在使用中，无法签退",
                });
              } else {
                // 事务操作
                db.beginTransaction((err) => {
                  if (err) {
                    res.send({
                      code: 400,
                      msg: err,
                    });
                  } else {
                    // 签退
                    const sql =
                      "UPDATE idevice SET isUsing = 0, isCheckIn = 0 WHERE deviceID = ?";
                    db.query(sql, [deviceID], (err, results) => {
                      if (err) {
                        db.rollback(function () {
                          res.send({
                            code: 400,
                            msg: "签退失败",
                          });
                        });
                      } else {
                        // 签退
                        const sql2 = `
                                                    UPDATE records
                                                    SET isCheckout = 1, endTime = ?
                                                    WHERE deviceID = ? 
                                                    AND isCheckout = 0
                                                    AND studentID = ?
                                                `;
                        const nowTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
                        db.query(
                          sql2,
                          [nowTime, deviceID, username],
                          (err, results) => {
                            if (err) {
                              db.rollback(function () {
                                res.send({
                                  code: 400,
                                  msg: err,
                                });
                              });
                            } else {
                              db.commit(function (err) {
                                if (err) {
                                  return db.rollback(function () {
                                    res.send({
                                      code: 400,
                                      msg: "签退失败",
                                    });
                                  });
                                } else {
                                  res.send({
                                    code: 200,
                                    msg: "签退成功！",
                                  });
                                  db.release();
                                }
                              });
                            }
                          }
                        );
                      }
                    });
                  }
                });
              }
            }
          }
        });
      }
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: err || "未知错误",
    });
  }
};

/**
 * 用户自动签退操作
 */
const autoCheckOut = (deviceID, studentID) => {
  db.getConnection((err, db) => {
    if (err) {
      console.log("db错误", err);
    } else {
      // 签退
      const sql =
        "UPDATE idevice SET isUsing = 0, isCheckIn = 0 WHERE deviceID = ?";
      db.query(sql, [deviceID], (err, results) => {
        if (err) {
          db.rollback(function () {
            console.log("失败");
          });
        } else {
          // 签退
          const sql2 = `
                            UPDATE records
                            SET isCheckout = 1, endTime = ?
                            WHERE deviceID = ? 
                            AND isCheckout = 0
                            AND studentID = ?
                        `;
          const nowTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
          db.query(sql2, [nowTime, deviceID, studentID], (err, results) => {
            if (err) {
              db.rollback(function () {
                console.log(err, "失败");
              });
            } else {
              db.commit(function (err) {
                if (err) {
                  return db.rollback(function () {
                    console.log("失败");
                  });
                } else {
                  console.log("成");
                  db.release();
                }
              });
            }
          });
        }
      });
    }
  });
};

/**
 * 判断当前的设备是否存在
 */
const isHasDevice = (deviceID: string) => {
  return new Promise((resolve, reject) => {
    const checkSql = "select * from idevice where deviceID = ?";
    // let hasDevice: boolean = false;
    db.query(checkSql, [deviceID], (err, results) => {
      if (err) {
        // hasDevice = false;
        reject(false);
      } else if (results && results.length > 0) {
        // hasDevice = true;
        resolve(true);
      } else {
        console.log("查询数据为空");
        resolve(false);
      }
    });
  });
};

/**
 * 新增设备
 */
const addDevice = async (req, res) => {
  const {
    deviceID,
    deviceName,
    buyDate,
    deviceConfig = "",
    devicePrice,
    deviceLocation,
    deviceManager,
  } = req.body;
  try {
    const hasDevice = await isHasDevice(deviceID);
    if (hasDevice) {
      res.send({
        code: 400,
        msg: "当前设备已存在，请勿重复添加",
      });
    } else {
      const sql =
        "INSERT INTO idevice (deviceID, deviceName, buyDate, deviceConfig, devicePrice,deviceLocation, deviceManager) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(
        sql,
        [
          deviceID,
          deviceName,
          buyDate,
          deviceConfig,
          devicePrice,
          deviceLocation,
          deviceManager,
        ],
        (err, results) => {
          console.log(results);
          if (err) {
            console.log(err);
            res.send({
              code: 400,
              msg: "新增失败",
            });
          } else {
            console.log("新增设备成功");
            res.send({
              code: 200,
              msg: "添加成功",
            });
          }
        }
      );
    }
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: err || "未知错误",
    });
  }
};

/**
 * 删除设备
 */
const deleteDevice = async (req, res) => {
  // console.log(req.body)
  const { deviceID } = req.body;
  try {
    const sql = "DELETE FROM idevice WHERE deviceID = ?";
    const hasDevice = await isHasDevice(deviceID);
    if (hasDevice) {
      db.query(sql, [deviceID], (err, results) => {
        if (err) {
          res.send({
            code: 400,
            msg: "删除失败",
          });
        } else {
          res.send({
            code: 200,
            msg: "删除成功",
            data: deviceID,
          });
        }
      });
    } else {
      res.send({
        code: 400,
        msg: "当前设备不存在",
      });
    }
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: err || "未知错误",
    });
  }
};

/**
 * 修改设备信息，此处不需要对deviceID进行修改
 */
const editDevice = async (req, res) => {
  const {
    deviceID,
    deviceName,
    buyDate,
    deviceConfig = "",
    devicePrice,
    deviceLocation,
    deviceManager,
  } = req.body;

  try {
    const flag = await isHasDevice(deviceID);
    if (flag) {
      const sql = `UPDATE idevice SET 
                deviceName = ?, 
                buyDate = ?, 
                deviceConfig = ?,
                devicePrice = ?,
                deviceLocation = ?,
                deviceManager = ?
            WHERE
                deviceID = ?`;
      db.query(
        sql,
        [
          deviceName,
          buyDate,
          deviceConfig,
          Number(devicePrice),
          deviceLocation,
          deviceManager,
          deviceID,
        ],
        (err, results) => {
          console.log(results);
          if (err) {
            // console.log(err)
            res.send({
              code: 500,
              msg: "修改失败",
            });
          } else if (results.affectedRows === 0) {
            res.send({
              code: 400,
              msg: "修改失败",
            });
          } else {
            res.send({
              code: 200,
              msg: "修改成功",
            });
          }
        }
      );
    } else {
      res.send({
        code: 400,
        msg: "当前设备不存在",
      });
    }
  } catch (err) {
    res.send({
      code: 500,
      msg: err.message || "未知错误",
    });
  }
};

/**
 * 模糊搜索--直接放到获取列表的接口
 */
// const queryDeviceWithID = (req, res) => {
//     const { curPage = 1, pageSize = 10, deviceID } = req.query;
//     // 计算起始记录
//     const offset = (curPage - 1) * pageSize;

//     // 总记录数查询（模糊搜索）
//     const totalQuery = 'SELECT COUNT(*) AS total FROM idevice WHERE deviceID LIKE ?';

//     // 分页数据查询（模糊搜索）
//     const dataQuery = 'SELECT * FROM idevice WHERE deviceID LIKE ? LIMIT ?, ?';

//     // 模糊搜索的模式
//     const searchPattern = '%' + deviceID + '%';

//     // 执行总记录数查询
//     db.query(totalQuery, [searchPattern], (err, totalResult) => {
//         if (err) {
//             res.send({
//                 code: 500,
//                 msg: err || '服务异常'
//             })
//         }
//         else {
//             const total = totalResult[0].total;

//             // 如果总记录数大于0，则执行分页数据查询
//             if (total > 0) {
//                 db.query(dataQuery, [searchPattern, offset, pageSize], (err, dataResult) => {
//                     if (err) {
//                         res.send({
//                             code: 500,
//                             msg: err || '服务异常'
//                         })
//                     }
//                     else {
//                         // 返回结果
//                         res.send({
//                             code: 200,
//                             msg: '查询成功',
//                             total: total,
//                             curPage: curPage,
//                             pageSize: pageSize,
//                             dataResult
//                         })
//                     }
//                 });
//             } else {
//                 res.send({
//                     code: 4001,
//                     msg: '没有数据',
//                     data: []
//                 })
//             }
//         }
//     });
// }

/**
 * 获取故障设备列表
 */
const getRepairList = (req, res) => {
  const curPage = parseInt(req.query.curPage, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const { type = "all", isNeedPage = true } = req.query;

  try {
    const totalSql =
      "SELECT COUNT(*) AS total FROM records WHERE isPushRepair = 1";
    // 计算分页查询的起点
    const offset = (curPage - 1) * pageSize;

    db.query(totalSql, (err, totalResult) => {
      if (err) {
        res.send({
          code: 500,
          msg: err || "服务异常",
        });
      } else {
        const total = totalResult[0].total;
        const totalPages = Math.ceil(total / pageSize);

        let sql = "select * from records where isPushRepair = 1";

        switch (type) {
          case "all":
            break;
          case "repaired":
            sql += " and isRepair = 1";
            break;
          case "unrepaired":
            sql += " and isRepair = 0";
            break;
        }
        if (isNeedPage) {
          sql += " limit ?,?";
        }

        db.query(sql, [offset, pageSize], (err, result) => {
          if (err) {
            res.send({
              code: 500,
              msg: err || "服务异常",
            });
          } else {
            res.send({
              code: 200,
              msg: "获取故障设备列表成功",
              data: {
                curPage,
                total,
                pageSize,
                totalPages,
                deviceList: result,
              },
            });
          }
        });
      }
    });
  } catch (err) {
    res.send({
      code: 500,
      msg: err.message || "未知错误",
    });
  }
};

/**
 * 修改设备维修信息
 */
const editRepair = (req, res) => {
  const { id, isRepair, repairTime } = req.body;
  console.log(req.body);

  try {
    const sql = "update records set isRepair = ?, repairTime = ? where id = ?";
    db.query(
      sql,
      [parseInt(isRepair), repairTime, parseInt(id)],
      (err, result) => {
        if (err) {
          res.send({
            code: 500,
            msg: err || "服务异常",
          });
        } else if (result && result.affectedRows > 0) {
          res.send({
            code: 200,
            msg: "修改成功",
          });
        } else {
          res.send({
            code: 400,
            msg: "修改失败",
          });
        }
      }
    );
  } catch (err) {
    res.send({
      code: 500,
      msg: err.message || "未知错误",
    });
  }
};

/**
 * excel 导出故障设备信息
 */
const exportRepairDeviceExcel = (req, res) => {
  const { type = "all" } = req.query;
  try {
    let sql = "select * from records where isPushRepair = 1";
    let filename = "故障设备信息表";
    switch (type) {
      case "all":
        filename = "故障信息总表";
        break;
      case "repaired":
        sql += " and isRepair = 1";
        filename = "已维修设备信息表";
        break;
      case "unrepaired":
        sql += " and isRepair = 0";
        filename = "未维修设备信息表";
        break;
    }
    // 获取设备列表
    db.query(sql, async (err, result) => {
      if (err) {
        res.send({
          code: 500,
          msg: err || "服务异常",
        });
      } else {
        const deviceData = result;
        deviceData.map((item) => {
          item.isRepair = item.isRepair === 1 ? "已维修" : "未维修";
        });
        const excelData = await exportExcel({
          data: deviceData,
          sheetName: filename,
          filename,
          header: repairDeviceExcel,
        });
        res.setHeader(
          "Content-disposition",
          `attachment;filename=${encodeURIComponent(filename)}.xlsx`
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.send(excelData);
      }
    });
  } catch (err) {
    res.send({
      code: 500,
      msg: err.message || "未知错误",
    });
  }
};

/**
 * excel 导出设备信息
 */
const exportDeviceExcel = (req, res) => {
  try {
    let sql = "select * from idevice";
    let filename = "设备信息总表";
    // 获取设备列表
    db.query(sql, async (err, result) => {
      if (err) {
        res.send({
          code: 500,
          msg: err || "服务异常",
        });
      } else {
        const deviceData = result;
        const excelData = await exportExcel({
          data: deviceData,
          sheetName: filename,
          filename,
          header: deviceExcel,
        });
        res.setHeader(
          "Content-disposition",
          `attachment;filename=${encodeURIComponent(filename)}.xlsx`
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.send(excelData);
      }
    });
  } catch (err) {
    res.send({
      code: 500,
      msg: err.message || "未知错误",
    });
  }
};

module.exports = {
  getDeviceList,
  generateQrcode,
  checkInDevice,
  checkOutDevice,
  deleteDevice,
  addDevice,
  editDevice,
  getRepairList,
  editRepair,
  exportDeviceExcel,
  exportRepairDeviceExcel,
};

export {};
