export default function Connected({isConnected})
{
    const connectedClass = isConnected ? 'bg-green-600' : 'bg-red-600';
    return <div className={`w-5 h-5 rounded-full animate-pulse ` + connectedClass}></div>
}