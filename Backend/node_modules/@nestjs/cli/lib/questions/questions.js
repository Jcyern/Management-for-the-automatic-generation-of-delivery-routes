export const generateInput = (name, message) => {
    return (defaultAnswer) => ({
        name,
        message,
        default: defaultAnswer,
    });
};
export const generateSelect = (name) => {
    return (message) => {
        return (choices) => {
            const choicesFormatted = choices.map((choice) => ({
                name: choice,
                value: choice,
            }));
            return {
                name,
                message,
                choices: choicesFormatted,
            };
        };
    };
};
