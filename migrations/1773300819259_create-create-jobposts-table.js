
export const up = (pgm) => {
    pgm.createTable('jobposts', {
        id: 'id',
        recruiter_id: { type: 'integer', notNull: true, references: 'recruiters(id)', onDelete: 'CASCADE' },
        title: { type: 'varchar(255)', notNull: true },
        description: { type: 'text', notNull: true },
        responsibilities: { type: 'text[]', notNull: true, default: '{}' },
        experience_min: { type: 'integer', default: 0 },
        experience_max: { type: 'integer', default: 0 },
        salary_min: { type: 'integer', default: 0 },
        salary_max: { type: 'integer', default: 0 },
        location: { type: 'varchar(255)', default: null },
        job_type: { type: 'jobtypes', default: 'Full Time' },
        category: { type: 'categories' },
        is_active: { type: 'boolean', default: true },
        createdat: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        updatedat: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    })
};

export const down = (pgm) => {
    pgm.dropTable('jobposts');
};
