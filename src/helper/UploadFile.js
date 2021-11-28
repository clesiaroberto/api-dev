import { v4 } from "uuid";

const upload = (file, folder) => {
    const uniq = v4();
    const { name, size, mimetype } = file;

    file.mv(`./uploads/${folder}/${uniq}` + name.replaceAll(" ", ""));

    return {
        name,
        size,
        mimetype,
        folder: `/${folder}/${uniq}` + name.replaceAll(" ", ""),
        filename: `${uniq}${name.replaceAll(" ", "")}`,
    };
};

export { upload };
