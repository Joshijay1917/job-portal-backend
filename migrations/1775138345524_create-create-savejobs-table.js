export const up = (pgm) => {
    pgm.createTable('savejobs', {
        candidate_id: {
            type: "integer",
            notNull: true,
            references: '"candidates"',
            onDelete: "CASCADE",
        },
        jobpost_id: {
            type: "integer",
            notNull: true,
            references: '"jobposts"',
            onDelete: "CASCADE",
        },
        createdat: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        updatedat: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });

    pgm.addConstraint('savejobs', 'savejobs_pk', {
        primaryKey: ['candidate_id', 'jobpost_id']
    });
}

export const down = (pgm) => {
    pgm.dropTable('savejobs')
}