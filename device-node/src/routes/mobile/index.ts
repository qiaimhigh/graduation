const db = require("../../mysql/mysql");
const dayjs = require("dayjs");

/**
 * 获取移动设备列表
 */
const getMobileList = (req, res) => {
  // 分页查询
  const curPage = parseInt(req.query.curPage, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const { mName } = req.query;
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
    let totalSql = "SELECT COUNT(*) AS total FROM mobile";
    // 计算分页查询的起点
    const offset = (curPage - 1) * pageSize;

    if (mName) {
      totalSql += " where mName like ?";
      queryParams.push(`%${mName}%`);
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

        let sql = "select * from mobile";
        if (mName) {
          sql += " where mName like ?";
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
            res.send({
              code: 200,
              msg: "获取移动设备列表成功",
              data: {
                curPage,
                total,
                totalPages,
                mobileList: result,
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
 * 新增移动设备
 */
const addMobile = (req, res) => {
  const {
    mPrice,
    mManager,
    mLocation,
    mType,
    mName,
    mBuyTime,
    count,
    type,
    mInfo,
  } = req.body;
  const sql =
    "INSERT INTO mobile (mPrice,mManager,mLocation,mType,mName,mBuyTime,count,type,canUseCount, mInfo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [
      mPrice,
      mManager,
      mLocation,
      mType,
      mName,
      mBuyTime,
      count,
      type,
      count,
      mInfo,
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
};

/**
 * 获取移动设备记录列表
 */
const getMobileRecordsList = (req, res) => {
  // 分页查询
  const curPage = parseInt(req.query.curPage, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const { studentID } = req.query;
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
    let totalSql = "SELECT COUNT(*) AS total FROM mobilerecords";
    // 计算分页查询的起点
    const offset = (curPage - 1) * pageSize;

    if (studentID) {
      totalSql += " where studentID like ?";
      queryParams.push(`%${studentID}%`);
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

        let sql = "select * from mobilerecords";
        if (studentID) {
          sql += " where studentID like ?";
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
            // const deviceList = result.map((item) => ({
            //   ...item,
            //   qrcode: item.qrcode ? item.qrcode.toString("utf8") : "",
            // }));
            res.send({
              code: 200,
              msg: "获取移动设备借用列表成功",
              data: {
                curPage,
                total,
                totalPages,
                mobileRecords: result,
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
 * 修改移动设备信息
 *
 */
const editMobileInfo = (req, res) => {
  const {
    id,
    mPrice,
    mManager,
    mLocation,
    mType,
    mName,
    mBuyTime,
    count,
    type,
  } = req.body;

  const sql = `UPDATE mobile SET 
              mPrice = ?, 
              mManager = ?, 
              mLocation = ?,
              mType = ?,
              mName = ?,
              mBuyTime = ?
              count = ?
              type = ?
            WHERE
              id = ?`;
  db.query(
    sql,
    [mPrice, mManager, mLocation, mType, mName, mBuyTime, count, id, type],
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
};

/**
 * 归还、借用等设备操作--改变设备的状态
 */
const changeMobileStatus = (req, res) => {
  const { id, status, mName } = req.body;
  let queryParams = [];
  let sql = `UPDATE mobilerecords SET statusType = ?`;
  queryParams.push(status);
  if (status === "2") {
    sql += ", endTime = ?";
    queryParams.push(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  }
  else if(status === "1"){
    sql += ", startTime = ?";
  }
  sql += ", handleTime = ? where id = ?"
  try {
    const curTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
    db.query(sql, [...queryParams, curTime, id], async (err, results) => {
      // console.log(results);
      if (err) {
        // console.log(err.message)
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
        let mobileSql = `UPDATE mobile SET 
                      canUseCount = canUseCount + ?
                    WHERE
                      mName = ?`;
        if (status === "3" || status === "2" || status === "4") {
          db.query(mobileSql, [1, mName], (err, results) => {
            if (err) {
              console.log(err);
            } else if (results.affectedRows === 0) {
              // res.send({
              //   code: 400,
              //   msg: "修改失败",
              // });
              console.log("修改失败");
            } else {
              res.send({
                code: 200,
                msg: "修改成功",
              });
            }
          });
        } else {
          res.send({
            code: 200,
            msg: "修改成功",
          });
        }
      }
    });
  } catch (err) {
    res.send({
      code: 500,
      msg: "修改失败",
    });
  }
};

/**
 * 删除设备
 */
const deleteMobile = async (req, res) => {
  const { mName } = req.body;
  try {
    const sql = "DELETE FROM mobile WHERE mName = ?";

    db.query(sql, [mName], (err, results) => {
      if (err) {
        res.send({
          code: 400,
          msg: "删除失败",
        });
      } else {
        res.send({
          code: 200,
          msg: "删除成功",
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
 * 小程序获取设备记录
 */
const appGetRecordsList = (req, res) => {
  const { studentID, statusType, mName } = req.query;
  const queryParams = [];
  let sql = "select * from mobile";
  if (mName) {
    sql += " where mName = ?";
    queryParams.push(mName);
  }
  if (statusType) {
    sql = "select * from mobilerecords where studentID = ? AND statusType = ?";
    queryParams.push(studentID, statusType);
  }

  try {
    db.query(sql, queryParams, (err, result) => {
      if (err) {
        console.log(err.message);
        res.status(500).send({
          code: 500,
          msg: "服务异常请稍后重试",
        });
      } else {
        res.send({
          code: 200,
          msg: "获取移动设备列表成功",
          data: result,
        });
      }
    });
  } catch (err) {
    console.log(err.message);
    res.send({
      code: 500,
      msg: "服务异常",
    });
  }
};

/**
 * 借用设备
 */
const borrowMobile = async (req, res) => {
  const { studentID, mName, mLocation, mManager } = req.body;
  try {
    const sql = "INSERT INTO mobilerecords (studentID, mName, startTime, statusType, mLocation, mManager) VALUES (?, ?, ?, '3', ?, ?)";
    const curTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
    db.query(sql, [studentID, mName, curTime, mLocation, mManager], (err, results) => {
      if (err) {
        res.send({
          code: 400,
          msg: "借用失败",
        });
      } else {
        const sql = "UPDATE mobile SET canUseCount = canUseCount - 1 WHERE mName = ?";
        db.query(sql, [mName], (err, results) => {
          if (err) {
            res.send({
              code: 400,
              msg: "借用失败",
            });
          } else {
            res.send({
              code: 200,
              msg: "借用成功",
            });
          }
        });
      }
    });
  } catch (err) {
    res.send({
      code: 500,
      msg: "借用失败",
    });
  }
};

module.exports = {
  getMobileList,
  addMobile,
  getMobileRecordsList,
  editMobileInfo,
  changeMobileStatus,
  deleteMobile,
  appGetRecordsList,
  borrowMobile
};

export {};
