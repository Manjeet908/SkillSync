import React,{useState,useEffect} from 'react'
import axios from 'axios';
import "./friendSuggestions.css";
function FriendSuggestions() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSuggestions=async()=>{
        try{
            const res=await axios.get("http://localhost:8000/api/v1/suggestions",{
                withCredentials:true,
            })
            setSuggestions(res.data);
        }catch{
            console.error("Error fetching friend suggestions:", error);
        }finally{
            setLoading(false);
        }
    }
    fetchSuggestions();
  }, []);
  return (
    <div classname="suggestions-container">
        <h2 className='suggestions-title'>Friend Suggestions</h2>
        {
            suggestions.map((user)=>(
                <div className='suggestion-item' key={user._id}>
                    <div className='suggestion-user'>
                        <img src={user.profilePicture || "https://via.placeholder.com/150"}
                        alt={user.username}
                        className='suggestion-avatar' 
                        />
                        <span>{user.username}</span>
                        <div>
                            <button onClick={()=>handleFollow(user._id)} className='btn-follow'>
                            Connect
                            </button>
                        </div>

                    </div>
                </div>
            ))
        }

    </div>
  )
}

export default FriendSuggestions