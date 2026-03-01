export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.MONGODB_URI) {
        const cron = await import('./lib/cron');
        cron.startCronJobs();
    }
}
