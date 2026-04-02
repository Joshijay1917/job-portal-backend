
export const up = (pgm) => {
    pgm.createType('categories', ['Software Developer', 'UI/UX', 'Data Science', 'Mobile Dev', 'AI/ML', 'Internship', 'Remote Job'])
};

export const down = (pgm) => {
    pgm.dropType('categories')
};
