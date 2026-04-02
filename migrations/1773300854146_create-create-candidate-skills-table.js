export const up = (pgm) => {
    pgm.createTable("candidate_skills", {
        candidate_id: {
            type: "integer",
            notNull: true,
            references: '"candidates"', // Links to your jobposts table
            onDelete: "CASCADE",
        },
        skill_id: {
            type: "integer",
            notNull: true,
            references: '"skills"', // Links to your jobposts table
            onDelete: "CASCADE",
        },
    });

    pgm.addConstraint('candidate_skills', 'candidate_skill_pk', {
        primaryKey: ['candidate_id', 'skill_id'],
    });

    pgm.createIndex('candidate_skills', 'skill_id');
};

export const down = (pgm) => {
    pgm.dropTable("candidate_skills");
};