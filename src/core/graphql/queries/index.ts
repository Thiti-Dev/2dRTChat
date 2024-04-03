import { graphqlClient } from ".."
import { GET_TOTAL_CONTRIBUTIONS_OF_USER } from "../../../shared/constants/gql/get-total-contribution"
import { GetTotalContributionsOfUserResponse, RefinedContributionData } from "../../../shared/types/contribution.types"

export async function getContributionsDataForThePast30Days(username: string): Promise<RefinedContributionData[]>{
    const past30Days = new Date()
    past30Days.setDate(past30Days.getDate() - 30)
    const {user:{contributionsCollection:{contributionCalendar:{weeks}}}} = await graphqlClient.request<GetTotalContributionsOfUserResponse>(GET_TOTAL_CONTRIBUTIONS_OF_USER,{
        username: username,
        from: past30Days,
        to: new Date()
    })

    return weeks.flatMap((weekData) => weekData.contributionDays).reverse().map((cData) => ({date: cData.date, count: cData.contributionCount}))
}