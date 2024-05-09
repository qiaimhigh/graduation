/**
 * https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%88%9B%E5%BB%BA%E5%B7%A5%E4%BD%9C%E7%B0%BF
 */
const ExcelJS = require('exceljs');

const excelConfig = {
    // excel视图，再查看时需要打开几个视图窗口
    defaultView: [
        {
            x: 0,
            y: 0,
            width: 10000,
            height: 20000,
            firstSheet: 0,
            activeTab: 1,
            visibility: 'visible'
        }
    ],
    fontName: 'Arial Unicode MS',
    font: { ame: 'Arial Unicode MS', family: 4, size: 13 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8DB4E2' } },
    border: { style: 'thin', color: { argb: 'cccccc' } }
}
/**
   * 导出excel
   * @param { Object } config 传入的excel对象
   * @param { Array } config.data excel的数据
   * @param { String } config.filename excel文件名
   * @param { Array } config.header excel的头部
   * @param { String } config.sheetName 表名
   * @param { String } config.creator 创建表的人
   * @param { String } config.lastModifiedBy 最后修改表的人
 */
export const exportExcel = async ({ 
    data,
    filename = 'excel',
    header,
    sheetName = 'Sheet1',
    creator = 'ricie',
    lastModifiedBy = 'admin'
}: {
    data: Array<any>;
    filename?: string;
    header: Array<{[key: string]: string;}>;
    sheetName?: string;
    creator?: string;
    lastModifiedBy?: string;
}) => {
    // 创建excel对象
    const workbook = new ExcelJS.Workbook();
    // 设置属性
    workbook.creator = creator;
    workbook.lastModifiedBy = lastModifiedBy;

    // 获取时间，一次就好
    const date = new Date();
    workbook.created = date;
    workbook.modified = date;
    workbook.lastPrinted = date;

    // 添加excel表
    const worksheet = workbook.addWorksheet(sheetName);
    workbook.views = excelConfig.defaultView;
    // 设置excel可见
    worksheet.state = 'visible';
    // 设置excel的表头
    worksheet.columns = header;

    // 设置excel没列的属性
    for (let i = 1; i <= header.length; i++) {
        worksheet.getColumn(i).alignment = { vertical: 'middle', horizontal: 'center' }
        worksheet.getColumn(i).font = { name: 'Arial Unicode MS' }
    }

    // 添加数据
    worksheet.addRows(data);
    // 设置表头样式
    worksheet.getRow(1).font = excelConfig.font
    worksheet.getRow(1).fill = excelConfig.fill

    // 导出excel I/O
    const excelBuffer = await workbook.xlsx.writeBuffer();
    // console.log(excelBuffer)
    return excelBuffer;
}