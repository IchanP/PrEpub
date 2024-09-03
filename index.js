import JSZip from "jszip";
import fs from "fs/promises";
import path from "path";

const epubPath = path.resolve("D:/School-Work/epub-fixer/epubs/toModify.epub");
const outputEpubPath = path.resolve("D:/School-Work/epub-fixer/epubs/output.epub");

fs.readFile(epubPath)
  .then(epubFile => JSZip.loadAsync(epubFile))
  .then(zip => {
    const chapterFilesPromises = [];

    zip.forEach((relativePath, file) => {
      if (/chapter/i.test(relativePath)) {
        chapterFilesPromises.push(
          file.async("string").then(content => {
            if (/Chapter1/.test(relativePath)) {
                console.log(content);
            }
            // Remove the specified string from the content
            const modifiedContent = content.replace(/<p class="calibre\d+"><br class="calibre3"\/><\/p>/g, "");
            // Replace the modified content back into the zip
            zip.file(relativePath, modifiedContent);
          })
        );
      }
    });



    return Promise.all(chapterFilesPromises).then(() => zip);
  })
  .then(zip => {
    // Repackage the entire EPUB
    return zip.generateAsync({ type: "nodebuffer" });
  })
  .then(buffer => {
    // Save the modified EPUB to a new file
    return fs.writeFile(outputEpubPath, buffer);
  })
  .then(() => {
    console.log("Modified EPUB file has been saved.");
  })
  .catch(err => {
    console.error("Error:", err);
  });
