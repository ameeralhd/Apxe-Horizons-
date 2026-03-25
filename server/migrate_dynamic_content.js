const { VideoResource, DynamicContent, sequelize } = require('./models');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');
        
        await sequelize.sync();
        console.log('Database synced.');

        // 1. Migrate VideoResource (Success Stories)
        const videos = await VideoResource.findAll();
        console.log(`Found ${videos.length} video resources to migrate.`);

        for (const video of videos) {
            // Extract video ID from URL if it's a full URL
            const extractVideoId = (url) => {
                if (!url) return '';
                const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                const match = url.match(regex);
                return match ? match[1] : url; // Fallback to url if no match (maybe it's already an ID)
            };

            const video_id = extractVideoId(video.url);

            await DynamicContent.findOrCreate({
                where: { youtube_url: video.url },
                defaults: {
                    category: 'success_story',
                    title: video.title,
                    youtube_url: video.url,
                    video_id: video_id,
                    status: true,
                    order_index: 0
                }
            });
        }
        console.log('Successfully migrated success stories.');

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
