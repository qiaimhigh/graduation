const db = require("../../mysql/mysql");

/**
 * 获取首页初始数据
 */
const getIndexInitData = (req, res) => {
  //获取用户总数
  let query1 = `
    SELECT 
        (SELECT count(*) FROM idevice WHERE isUsing = 1) as ideviceCount,
        (SELECT count(*) FROM user) as userCount,
        (SELECT count(*) FROM records WHERE isRepair = 0) as recordsCount,
        (SELECT count(*) FROM idevice) as totalDeviceCount
    `;

  let query2 = `
    SELECT 
      c.college, 
      IFNULL( COUNT(u.college),0 )  AS NumberOfStudents 
    FROM 
      user c
      LEFT JOIN 
      USER u
      ON 
      c.college = u.college 
    WHERE 
      c.college IN ('计算机学院', '网络空间安全', '电子工程学院', '自动化学院', '通信与信息工程学院', '人文与外国语学院', '理学院', '经济与管理学院', '体育部') 
    GROUP BY 
    c.college
    `;

  // 建立一个对象，用来存储两个查询的结果
  let resultData = {};

  db.query(query1, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    // 将查询的结果存储在 resultData 对象中
    // @ts-ignore
    resultData.query1 = result[0];

    db.query(query2, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      // 同样的，将查询的结果也存储在 resultData 对象中
      // @ts-ignore
      resultData.query2 = result;

      res.send({
        code: 200,
        data: resultData,
      });
    });
  });
};

module.exports = {
  getIndexInitData,
};

export {};
