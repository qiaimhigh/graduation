
const dayjs = require("dayjs");
const db = require("../../mysql/mysql");
const { getAPPToken, verifyAPPToken } = require("../user/auth");

/**
 * @description 登录
 */
const appLoginFun = (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  if (!username || !password) {
    return res.status(400).send({
      code: 404,
      msg: "参数错误",
    });
  }

  try {
    const sql = "select * from user where studentID = ?";
    db.query(sql, [username], (err, result) => {
      console.log(result);
      if (err) {
        res.status(500).send({
          code: 500,
          msg: "数据异常",
        });
      } else if (result && result?.length > 0) {
        const user = result[0];
        const payload = {
          username,
        };
        const data = JSON.parse(JSON.stringify(user));
        // 剔除密码，增加安全
        delete data.password;
        if (user && user.studentID === username && user.password === password) {
          const token = getAPPToken(payload);
          return res.send({
            code: 200,
            msg: "登陆成功",
            data: {
              token,
              data,
            },
          });
        } else {
          res.status(401).send({
            code: 402,
            msg: "请输入正确的账号或密码",
          });
        }
      } else {
        res.status(404).send({
          code: 404,
          msg: "当前账号不存在，请输联系管理员添加账号",
          data: [],
        });
      }
    });
  } catch (err) {
    res.send({
      code: 500,
      msg: err || "未知错误",
    });
  }
};

/**
 * 验证token是否有效
 */
const verifyToken = async (req, res) => {
  const { token = "" } = req.body;
  const vRes = await verifyAPPToken(token);

  if (!!vRes) {
    res.send({
      code: 200,
      msg: "验证成功",
    });
  } else {
    res.send({
      code: 401,
      msg: "验证失败",
    });
  }
};

/**
 * 验证refreshToken是否有效，并且刷新短token
 * 对于活跃用户的话，可以在每次刷新短token的时候返回长token，保证一直处于登录态
 */
// const refreshTokenApi = (req, res) => {
//     const refreshToken = req.headers['refesh'];
//     const { username } = req.query;
//     try {
//         jwt.verify(refreshToken, SECRET_KEY, (err) => {
//             if (err) {
//                 res.send({
//                     code: 401,
//                     msg: 'Unauthorized: 无权限 token无效'
//                 })
//             }
//             else {
//                 const payload = { username };
//                 const accessToken = getJsonToken(payload);
//                 const refreshToken = getRefreshToken(payload);
//                 res.send({
//                     code: 200,
//                     msg: '刷新成功',
//                     data: {
//                         accessToken,
//                         refreshToken
//                     }
//                 })
//             }
//         });
//     }
//     catch (err) {
//         return res.status(401).send({
//             code: 401,
//             msg: 'Unauthorized'
//         });
//     }
// }

/**
 * 获取当前用户使用记录
 */
const getUserDeviceRecords = (req, res) => {
  const { studentID, tag } = req.query;
  // console.log('repair', repair)
  console.log(studentID, tag);
  let sql = "select * from records where studentID = ?";

  switch (tag) {
    case "all":
      break;
    case "using":
      sql += " and isCheckout = 0";
      break;
    case "borrwoed":
      sql += " and isCheckout = 1";
      break;
    case "repair":
      sql += " and isPushRepair = 1";
      break;
  }

  console.log(sql);

  try {
    db.query(sql, [studentID], (err, result) => {
      if (err) {
        res.send({
          code: 400,
          msg: "查询失败",
        });
      } else {
        res.send({
          code: 200,
          msg: "获取成功",
          data: result,
        });
      }
    });
  } catch (error) {
    res.send({
      code: 500,
      msg: error,
    });
  }
};

/**
 * 故障上报
 *
 */
const pushRepair = (req, res) => {
  const { studentID, deviceID, repairCause, id } = req.body;

  console.log(studentID, deviceID, repairCause);
  try {
    const curTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const sql =
      "update records set isPushRepair = 1, repairCause = ?, repairPushTime = ? where id = ?";
    db.query(sql, [repairCause, curTime, id], (err, result) => {
      if (err) {
        res.send({
          code: 400,
          msg: "提交失败",
        });
      } else {
        res.send({
          code: 200,
          msg: "提交成功",
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.send({
      code: 500,
      msg: error,
    });
  }
};



module.exports = {
  getUserDeviceRecords,
  pushRepair,
  appLoginFun,
  verifyToken,
};

export {};
