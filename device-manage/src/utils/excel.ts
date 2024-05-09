/**
 * 本地保存文件并导出
 * @param { Object } Obj 导出文件参数对象
 * @param { Blob } file 文件资源
 * @param { String } fileName 文件名称(注意：包含后缀)
 */
interface SaveFileType {
    file: any,
    fileName: string,
    option?: { type: string }
}

// @ts-ignore
export const localSaveFile = ({ file, fileName, option = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } }: SaveFileType) => {
    // 生成Blob文件
    const blob = new Blob([file], option)
    console.log(blob)
    // 非IE环境
    const save_link = document.createElement('a');
    save_link.href = URL.createObjectURL(blob);
    save_link.download = fileName;
    document.body.appendChild(save_link);
    // console.log(save_link)
    save_link.click();
    setTimeout(() => {
        // 卸载不需要的元素
        document.body.removeChild(save_link);
        // 回收url
        window.URL.revokeObjectURL(save_link.href);
    }, 0)
}