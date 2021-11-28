// expected output: "123.456,79 €"
export const formatCurrency = (value) => {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
    })
        .format(value)
        .replaceAll("€", "");
};
