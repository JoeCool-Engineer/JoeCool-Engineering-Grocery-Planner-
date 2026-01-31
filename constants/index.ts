export const DAYS_OF_WEEK_IN_ORDER = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
] as const;

export const PrivateNavLinks = [
{
    imgURL: './events.svg',
    label: 'My Events',
    route: '/events'
},
{
    imgURL: './meeting.svg',
    label: 'Recipes',
    route: '/recipes'
},
{
    imgURL: './planning.svg',
    label: 'Meal Plan',
    route: '/meal-plan'
},
{
    imgURL: './schedule.svg',
    label: 'My Schedule',
    route: '/schedule'
},
{
    imgURL: './public.svg',
    label: 'Public Profile',
    route: '/book'
}
] as const;
