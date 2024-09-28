import { useState, useEffect } from "react";
import style from './Profile.module.css';
import axios from 'axios';

export function Profile() {
    const [data, setData] = useState([]);  
    const [personalinfos, setpersonalinfos] = useState([]); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [loveCounts, setLoveCounts] = useState({});
    const [animationState, setAnimationState] = useState('');
    const [personalInfoList, setPersonalInfoList] = useState([]);
    const [totalImages, setTotalImages] = useState(0); // Track total images
    const [lastRandomId, setLastRandomId] = useState(null); // Track the last random ID

    useEffect(() => {
        const fetchData = async () => {
            try {
                const personalInfoResponse = await axios.get('http://localhost:3000/personalinfo');
                setPersonalInfoList(personalInfoResponse.data);
                const ids = personalInfoResponse.data.map(item => item.id); 
                setpersonalinfos(ids); 
                await fetchImages(ids); 
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchImages = async (ids) => {
        try {
            const imageResponse = await axios.get('http://localhost:3000/image');
            let randomId;

            // Ensure the new random ID is different from the last one
            do {
                randomId = ids[Math.floor(Math.random() * ids.length)];
            } while (randomId === lastRandomId);

            const filteredData = imageResponse.data.filter(item => item.personalinfo === randomId); 

            setTotalImages(filteredData.length); // Set total images
            if (filteredData.length === 0) {
                setData([]); 
                setCurrentIndex(0); 
            } else {
                setData(filteredData); 
                setCurrentIndex(0); 
            }

            setLastRandomId(randomId); // Update the last random ID
        } catch (error) {
            setError(error);
        }
    };

    const randomizeData = async () => {
        if (personalinfos.length === 0) return; 
    
        setAnimationState('fly-out'); // Start exit animation
        setTimeout(async () => {
            await fetchImages(personalinfos); 
            setAnimationState('fly-in'); // Start entrance animation
        }, 1000); 
    };

    if (loading) return <div className={style.loading}>Loading.....</div>;
    if (error) return <div className={style.error}>{error.message}</div>;

    const handleClickButton = (personalinfo) => {
        setLoveCounts(prevCounts => ({
            ...prevCounts,
            [personalinfo]: (prevCounts[personalinfo] || 0) + 1
        }));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
    };

    const currentData = data.length > 0 ? data[currentIndex] : null;
    const currentPersonalInfo = personalInfoList.find(person => person.id === currentData?.personalinfo);

    // Function to calculate age
    const calculateAge = (birthday) => {
        if (!birthday) return "No birthday available"; // Handle empty birthday
    
        // Split the birthday string and validate its format
        const birthDateParts = birthday.split(" ")[0].split("-");
        if (birthDateParts.length !== 3 || birthDateParts[0].length !== 2 || birthDateParts[1].length !== 2 || birthDateParts[2].length !== 4) {
            return "Invalid Date"; // Ensure it's in DD-MM-YYYY format
        }
    
        // Convert to YYYY-MM-DD format for the Date constructor
        const formattedBirthday = `${birthDateParts[2]}-${birthDateParts[1]}-${birthDateParts[0]}`;
        const birthDate = new Date(formattedBirthday);
        const today = new Date();
    
        // Check if the date is valid
        if (isNaN(birthDate.getTime())) {
            return "Invalid Date"; // Return message if the birth date is invalid
        }
    
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Check if the birthday has occurred this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--; // Decrement age if the birthday hasn't occurred yet this year
        }
    
        return age;
    };

    // Function to create borders above the image
    const renderImageBorder = () => {
        const borders = [];
        for (let i = 0; i < totalImages; i++) {
            borders.push(
                <div 
                    key={i} 
                    className={`${style.imageBorder} ${currentIndex === i ? style.activeBorder : ''}`} 
                    style={{ flex: 1 }} // Use flex to distribute borders according to count
                />
            );
        }
        return <div className={style.imageBorderContainer}>{borders}</div>;
    };

    return (
        <div className={style.card_container}>
            <div className={`${style.Profile_Card} ${style[animationState]}`}>
                <div className={style.Profile_Content}>
                    <p>MchatSystem</p>
        
                    <div className={style.Image_Container}>
                        {renderImageBorder()} {/* Display image borders */}
                        <img 
                            src={`./src/assets/Images/${currentData && currentData.image ? currentData.image + ".JPG" : 'NOTFOUND.PNG'}`} 
                            alt={`Profile ${currentIndex}`} 
                            className={style.Profile_Image} 
                        />
                        <div className={style.Profile_status}>
                        <p>
                            {currentData ? currentPersonalInfo.firstname : "No personal info available."}  
                            {currentPersonalInfo?.birthday 
                                ? ` ${calculateAge(currentPersonalInfo.birthday)}` 
                                : " | No birthday available."}
                        </p>
                            <p>Total Loved: {currentData ? (loveCounts[currentData.personalinfo] || 0) : 0}</p>
                        </div>
                    </div>

                    <div className={style.button_zone}>
                        <button 
                            className={`${style.circleButton} ${style.red}`} 
                            onClick={randomizeData}
                            title="Randomize"
                        >
                            <span className={style.icon}>🎲</span>
                        </button>
                        <button 
                            className={`${style.circleButton} ${style.green}`} 
                            onClick={() => handleClickButton(currentData.personalinfo)} 
                            title="Love"
                        >
                            <span className={style.icon}>❤️</span>
                        </button>
                        <button 
                            className={`${style.circleButton} ${style.blue}`} 
                            onClick={() => handleClickButton(currentData.personalinfo)} 
                            title="Like"
                        >
                            <span className={style.icon}>👍</span>
                        </button>
                        <button 
                            className={`${style.circleButton} ${style.yellow}`} 
                            onClick={() => handleClickButton(currentData.personalinfo)} 
                            title="Support"
                        >
                            <span className={style.icon}>👏</span>
                        </button>
                        <button 
                            className={`${style.circleButton} ${style.orange}`} 
                            onClick={() => handleClickButton(currentData.personalinfo)} 
                            title="Something"
                        >
                            <span className={style.icon}>🖌️</span>
                        </button>
                    </div>
                </div>
                <div className={style.navigationButtons}>
                    <button onClick={handlePrev} disabled={data.length === 0}>❮ Previous</button>
                    <button onClick={handleNext} disabled={data.length === 0}>Next ❯</button>
                </div>
            </div>
        </div>
    );
}
