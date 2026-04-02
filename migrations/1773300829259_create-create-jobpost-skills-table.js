export const up = (pgm) => {
    pgm.createTable("jobpost_skills", {
        jobpost_id: {
            type: "integer",
            notNull: true,
            references: '"jobposts"', // Links to your jobposts table
            onDelete: "CASCADE",
        },
        skill_id: {
            type: "integer",
            notNull: true,
            references: '"skills"', // Links to your jobposts table
            onDelete: "CASCADE",
        },
    });

    pgm.addConstraint('jobpost_skills', 'jobpost_skill_pk', {
        primaryKey: ['jobpost_id', 'skill_id'],
    });

    pgm.createIndex('jobpost_skills', 'skill_id');
};

export const down = (pgm) => {
    pgm.dropTable("jobpost_skills");
};