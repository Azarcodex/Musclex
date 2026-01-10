import { useSelector } from 'react-redux'
import {Navigate} from 'react-router-dom'
export default function AdminRoute({children})
{
    const {isAuth}=useSelector(state=>state.adminAuth)
    if(!isAuth)
    {
        return <Navigate to={"/admin/login"} replace />
    }
    return children
}