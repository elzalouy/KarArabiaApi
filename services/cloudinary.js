const _ = require("lodash");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Path = require("path");

function deletePublic() {
  let dir = __dirname.split("services");
  const directory = Path.join(dir[0], "public");
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      if (file !== ".placeholder")
        fs.unlink(Path.join(directory, file), (err) => {
          if (err) throw err;
        });
    }
  });
}

async function uploadImage(path) {
  const result = await cloudinary.uploader.upload(path, {
    folder: "kararabia",
  });
  if (result) return { url: result.secure_url, public_id: result.public_id };
  return null;
}

function getImage(path) {
  cloudinary.image(path);
}

async function deleteImage(path) {
  const result = await cloudinary.uploader.destroy(path);
}

module.exports = {
  uploadImage: uploadImage,
  getImage: getImage,
  deleteImage: deleteImage,
  deletePublic: deletePublic,
};
