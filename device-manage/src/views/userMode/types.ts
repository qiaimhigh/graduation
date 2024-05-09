export interface UserInfo {
    id: number;
    // 学号
    studentID: string;
    // 学号
    userName: string;
    // 使用时长
    useTime: string;
    // 学院
    college: string;
    // 专业
    major: string;
    // 年级
    grade: string;
    // 预警次数
    warningTimes: number | string;
}