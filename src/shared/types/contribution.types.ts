interface GetTotalContributionsOfUserResponse {
    user: {
        contributionsCollection: ContributionsCollection
    }
}
interface ContributionsCollection {
    contributionCalendar: ContributionCalendar;
}
interface ContributionCalendar {
    totalContributions: number;
    weeks: Week[];
}
interface Week {
    contributionDays: ContributionDay[];
}
interface ContributionDay {
    date: string;
    weekday: number;
    contributionLevel: string;
    contributionCount: number;
}
interface RefinedContributionData{
    date: string;
    count: number;
}

export {
    GetTotalContributionsOfUserResponse,
    RefinedContributionData
}