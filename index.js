const fs = require('fs');

const FOLDER_SIZE = 60;
const TITLE_ID_SIZE = 16;

const extractIdsFromFile = (file) => {
  const fileString = file.toString();
  const folders = fileString.split('\n\n');
  return folders.reduce((prev, curr) => {
    const ids = curr.split('\n').filter((str) => str !== '');
    
    prev.push({
      name: ids[0],
      titles: ids.slice(1).map((idLine) => Buffer.from(idLine.toLowerCase().split(' ')[0], 'hex')),
    });
    return prev;
  }, []);
}

const getWriteAddress = (folderStartAddr, i = 0) => {
  if(i >= FOLDER_SIZE) throw new Error('index out of range');
  return folderStartAddr - ((FOLDER_SIZE - i) * TITLE_ID_SIZE) - 1;
}

const findFolderIndex = (buffer, folderName) => {
  return buffer.indexOf(`${Buffer.from(folderName.split('').join('\0'))}\0\0`);
}

const writeAddr = (writeBuf, addr, buf) => {
  console.log(buf.length, buf, addr.toString(16), buf.toString('hex'));
  return writeBuf.set(buf, addr);
}

let file = fs.readFileSync('./BaristaAccountSaveFile.dat');
const replacementIds = fs.readFileSync('./games');

const ids = extractIdsFromFile(replacementIds);


ids.forEach((folder) => {
  const addr = findFolderIndex(file, folder.name);
  console.log(folder.name, addr.toString(16));
  folder.titles.forEach((title, index) => {
    console.log(writeAddr(file, getWriteAddress(addr, index), title));
  });
});

fs.writeFileSync('./BaristaAccountModified.dat', file);