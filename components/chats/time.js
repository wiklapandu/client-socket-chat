import moment from "moment";

export default function TimeChat({time})
{
    const date = moment(time);
    const text = moment().diff(date, 'minutes') > 20 ? date.format('hh:mm') : date.fromNow();
    return <span className={`block text-right`}>{text}</span>
}