import { FilesCollection } from "meteor/ostrio:files";

function checkSize(size) {
  return size <= 10485760;
}
function checkFormat(regex_formats, file) {
  return regex_formats.test(file.extension);
}
function checkFile(size, regex_formats, file) {
  if (!checkSize(size)) return "El tamaño maximo del archivo es de 10Mb";
  if (!checkFormat(regex_formats, file))
    return "Formato no válido, solo se aceptan imagenes";
  return true;
}
export const photosCollection = new FilesCollection({
  collectionName: "photos",
  storagePath: "/data/photos",
  onBeforeUpload(file) {
    return checkFile(10485760, /png|jpg|jpeg/i, file);
  },
});

