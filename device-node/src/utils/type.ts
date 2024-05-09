export interface ExcelType {
    data: Array<any>;
    filename?: string;
    header: {[key: string]: string;};
    sheetName?: string;
    creator?: string;
    lastModifiedBy?: string;
}
