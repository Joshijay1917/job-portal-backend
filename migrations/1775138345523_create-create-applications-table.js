
export const up = (pgm) => {
    pgm.createTable('applications', {
        id: 'id',
        jobpost_id: { type: 'integer', notNull: true, references: 'jobposts(id)', onDelete: 'CASCADE' },
        candidate_id: { type: 'integer', notNull: true, references: 'candidates(id)', onDelete: 'CASCADE' },
        status: { type: 'status', default: 'Applied' },
        cover_letter: { type: 'text', default: null },
        createdAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        updatedAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    })
};

export const down = (pgm) => {
    pgm.dropTable('applications');
};