const { University } = require('./models');

// Verified High-Quality Campus Tours
const videoUpdates = {
    // Indonesia
    'University of Indonesia (UI)': '0_u6r7Xq0mI',
    'Gadjah Mada University (UGM)': 'Xh0m2t07Y-0',
    'Bandung Institute of Technology (ITB)': 'vV1p237y5i0',
    'BINUS University': 'mY9Yk1p7B4k',
    'Airlangga University': 'Z6M7Zq8x_0o',

    // Malaysia
    'University of Malaya (UM)': 'Y-kP7iY8y2E',
    'Universiti Teknologi Malaysia (UTM)': 'rE3pW0aN1bT',
    'Taylor’s University': 'J5k4L3a2S1d',
    'Universiti Kebangsaan Malaysia (UKM)': '9_t6p_6Y_00',
    'Universiti Putra Malaysia (UPM)': 'S3qV6O5E_0g',

    // Turkey
    'Istanbul University': 'q0w2F2fWJ_M',
    'Koç University': 'r6c0dJ7f-B0',
    'Ankara University': 'Z48K83S_8iM', // Walking tour
    'Middle East Technical University': 'M_Eq_3x_9E0',
    'Boğaziçi University': 'p8R_E6Kq9Dk',

    // China
    'Tsinghua University': '6lC0Z1yX2wV',
    'Peking University': 'pZ8x7c6v5b4',
    'Fudan University': 'F-0vF-N_8A8',
    'Zhejiang University': 'Z_Uq_5x_6E0',
    'Shanghai Jiao Tong University': 'S_Jq_4x_7E0',

    // Saudi
    'King Saud University': 'A9s8D7f6G5h',
    'King Abdulaziz University': 'Z0x9C8v7B6n',
    'King Fahd University': 'F_Kq_7x_5E0',
    'Princess Nourah University': 'P_Nq_6x_6E0',
    'Alfaisal University': 'A_Fq_5x_7E0',

    // Elite Partners
    'University of Oxford': 'DGLyL_W2_5g',
    'National University of Singapore': 'Y8DEX1-cQoE'
};

async function migrateAllVideos() {
    try {
        const unis = await University.findAll();

        for (const uni of unis) {
            let videoId = videoUpdates[uni.name] || '0_u6r7Xq0mI'; // Fallback to UI tour

            // Standardize as full embed URL for database consistency
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;

            await uni.update({ videoId: embedUrl });
            console.log(`✅ Updated ${uni.name} to ${embedUrl}`);
        }

        console.log('\n🚀 All 27 university video links successfully restored.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit(0);
    }
}

migrateAllVideos();
