/* eslint-disable @typescript-eslint/no-unused-vars */
export const getMeetingUrl = (_date: string, _time: string) => {
    try {
        const url = 'https://meet.google.com/oae-vpbv-mdy'
        return url
    } catch (error) {
        throw error
    }
}