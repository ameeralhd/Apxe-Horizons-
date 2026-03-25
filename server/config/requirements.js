const REQUIREMENTS = {
    scholarship: {
        'Undergraduate': [
            { id: 'u1', name: 'Academic Transcripts', description: 'Certified school transcripts for all years of study.' },
            { id: 'u2', name: 'School Certificate', description: 'High School completion or equivalent certificate.' },
            { id: 'u3', name: 'Statement of Purpose', description: 'A detailed essay on your academic background and goals.' },
            { id: 'u4', name: 'Letters of Recommendation', description: 'At least two letters from teachers or mentors.' },
            { id: 'u5', name: 'CV', description: 'Comprehensive curriculum vitae highlighting achievements.' },
            { id: 'u6', name: 'Medical Report', description: 'Official medical fitness report from an approved clinic.' },
            { id: 'u7', name: 'English Proficiency (TOEFL/IELTS)', description: 'Valid English language test scores.' },
            { id: 'u8', name: 'Personal Photo', description: 'Recent passport-sized photograph (white background).' },
            { id: 'u9', name: 'Additional Certificates', description: 'Any extra-curricular or specialized certificates.' }
        ],
        'Postgraduate': [
            { id: 'p1', name: 'Academic Transcripts', description: 'Official transcripts from your undergraduate degree.' },
            { id: 'p2', name: 'Statement of Purpose', description: 'Advanced essay on research interests and motivation.' },
            { id: 'p3', name: 'Letters of Recommendation', description: 'Three letters from professors or academic supervisors.' },
            { id: 'p4', name: 'CV', description: 'Academic CV including research or projects.' },
            { id: 'p5', name: 'Medical Certificate', description: 'Proof of health and vaccination history.' },
            { id: 'p6', name: 'English Proficiency (TOEFL/IELTS)', description: 'Advanced English language test scores.' },
            { id: 'p7', name: 'Personal Photo', description: 'Recent professional headshot.' },
            { id: 'p8', name: 'Additional Certificates', description: 'Internships, publications, or professional certifications.' }
        ],
        'PhD': [
            { id: 'd1', name: 'Academic Transcripts', description: 'Transcripts from both Bachelor and Master degrees.' },
            { id: 'd2', name: 'Research Proposal', description: 'Comprehensive document outlining your proposed doctoral research.' },
            { id: 'd3', name: 'Letters of Recommendation', description: 'Strong endorsements from senior academic researchers.' },
            { id: 'd4', name: 'CV', description: 'Detailed academic resume with publication list.' },
            { id: 'd5', name: 'Medical Certificate', description: 'Certified medical report for long-term residency.' },
            { id: 'd6', name: 'English Proficiency (TOEFL/IELTS)', description: 'Native-level English proficiency scores.' },
            { id: 'd7', name: 'Personal Photo', description: 'Official passport-sized biometric photo.' },
            { id: 'd8', name: 'Additional Certificates', description: 'Conference出席 certificates, patents, or awards.' }
        ]
    },
    job: {
        'Technical': [
            { id: 'jt1', name: 'Resume', description: 'Detailed professional resume showcasing technical skills.' },
            { id: 'jt2', name: 'Portfolio', description: 'Link to GitHub, GitLab, or a personal tech portfolio site.' },
            { id: 'jt3', name: 'Certifications', description: 'Valid industry certifications (e.g., AWS, Google Cloud, Cisco).' },
            { id: 'jt4', name: 'Technical Skills Assessment', description: 'Results of specific technical screening or coding tests.' }
        ],
        'Management': [
            { id: 'jm1', name: 'Resume', description: 'Executive-level resume highlighting leadership and impact.' },
            { id: 'jm2', name: 'Cover Letter', description: 'Letter detailing your management philosophy and role fit.' },
            { id: 'jm3', name: 'Leadership Experience', description: 'Documentation of team size, budget management, and projects.' },
            { id: 'jm4', name: 'References', description: 'Contact details of three former senior management colleagues.' }
        ],
        'Creative': [
            { id: 'jc1', name: 'Portfolio', description: 'Comprehensive creative portfolio (Behance, Dribbble, or PDF).' },
            { id: 'jc2', name: 'Resume', description: 'A well-designed visual or innovative resume.' },
            { id: 'jc3', name: 'Cover Letter', description: 'Personalized letter showing creative vision and intent.' },
            { id: 'jc4', name: 'Samples of Work', description: 'Original files or high-quality exports of key projects.' }
        ]
    },
    visa: {
        'USA': [
            { id: 'v1', name: 'Passport', description: 'Valid for at least six months beyond your stay.' },
            { id: 'v2', name: 'DS-160 Confirmation', description: 'Online Nonimmigrant Visa Application confirmation.' },
            { id: 'v3', name: 'Appointment Confirmation', description: 'Visa interview appointment letter.' },
            { id: 'v4', name: 'I-20 Form', description: 'Certificate of Eligibility for F-1 status.' },
            { id: 'v5', name: 'SEVIS Fee Receipt', description: 'Proof of I-901 SEVIS fee payment.' },
            { id: 'v6', name: 'Financial Evidence', description: 'Sufficient funds for the duration of the course.' }
        ],
        'UK': [
            { id: 'v7', name: 'Passport', description: 'Must have at least one blank page.' },
            { id: 'v8', name: 'CAS Statement', description: 'Confirmation of Acceptance for Studies.' },
            { id: 'v9', name: 'Financial Proof', description: 'Bank statements showing 28 days of funds.' },
            { id: 'v10', name: 'TB Test Results', description: 'If applying from a country on the TB test list.' },
            { id: 'v11', name: 'English Qualification', description: 'IELTS for UKVI or other SELT tests.' }
        ],
        'Canada': [
            { id: 'v12', name: 'Study Permit Approval Letter', description: 'Official letter from IRCC.' },
            { id: 'v13', name: 'Letter of Acceptance (LOA)', description: 'Official admission letter from a DLI.' },
            { id: 'v14', name: 'Financial Support Proof', description: 'GIC certificate and tuition receipts.' },
            { id: 'v15', name: 'Passport/Identity Doc', description: 'Valid passport and biometric records.' }
        ],
        'Australia': [
            { id: 'v16', name: 'CoE Confirmation', description: 'Confirmation of Enrolment from an Australian school.' },
            { id: 'v17', name: 'Health Insurance (OSHC)', description: 'Overseas Student Health Cover certificate.' },
            { id: 'v18', name: 'GTE Statement', description: 'Genuine Temporary Entrant personal statement.' },
            { id: 'v19', name: 'Financial History', description: 'Evidence of consistent financial capacity.' }
        ],
        'Germany': [
            { id: 'v20', name: 'German Blocked Account', description: 'Proof of €11,208 deposited for first year.' },
            { id: 'v21', name: 'University Admission Letter', description: 'Direct admission or preparatory course letter.' },
            { id: 'v22', name: 'Health Insurance', description: 'German public or private health insurance proof.' },
            { id: 'v23', name: 'German Proficiency', description: 'TestDaF, DSH, or Goethe certificates if required.' }
        ],
        'Default': [
            { id: 'v0', name: 'Valid Passport', description: 'Valid for at least 6 months.' },
            { id: 'v01', name: 'Visa Application Form', description: 'Completed and signed application form.' },
            { id: 'v02', name: 'Biometric Photos', description: 'Two recent biometric passport photographs.' }
        ]
    }
};

module.exports = REQUIREMENTS;
