
export const confirmDelete = (identifier: string) => {
    const result = window.confirm(`This will delete ${identifier} ! Continue?`);
    return result;
};
