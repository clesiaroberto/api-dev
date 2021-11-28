import path from "path";

export const fonts = {
    Courier: {
        normal: path.resolve("src/fonts/Courier/CourierPrime-Regular.ttf"),
        bold: path.resolve("src/fonts/Courier/CourierPrime-Bold.ttf"),
        italics: path.resolve("src/fonts/Courier/CourierPrime-Italic.ttf"),
        bolditalics: path.resolve(
            "src/fonts/Courier/CourierPrime-BoldItalic.ttf"
        ),
    },
    Roboto: {
        normal: path.resolve("src/fonts/Roboto-Regular.ttf"),
        bold: path.resolve("src/fonts/Roboto-Medium.ttf"),
        italics: path.resolve("src/fonts/Roboto-Italic.ttf"),
        bolditalics: path.resolve("src/fonts/Roboto-MediumItalic.ttf"),
    },
};
