
export const up = (pgm) => {
    pgm.createType('categories', ['Software Developer', 'UI/UX', 'Data Science', 'Mobile Dev', 'AI/ML', 'Internships', 'Remote Jobs'])
};

export const down = (pgm) => {
    pgm.dropType('categories')
};