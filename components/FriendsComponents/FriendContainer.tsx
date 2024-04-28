import React, { useState, useEffect } from 'react'
import { Row, Column, Button, Pressable, Text, Spacer, Avatar } from 'native-base'
import { IUser } from '@/components/FirebaseUserFunctions';
import { router } from 'expo-router';
import { useAuth } from '@/Context/AuthContext';
import { doc, updateDoc, arrayRemove, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/firebaseConfig';
import { getUserIcon } from '@/components/FirebaseUserFunctions';

interface FriendProps {
    friend: IUser;
    fetchData: () => void;
}

const friendContainer: React.FC<FriendProps> = ({ friend, fetchData }) => {
    const [isPressed, setIsPressed] = useState<boolean>(false);
    const { currUser, updateCurrUser, updateFriend } = useAuth();
    const [friendIcon, setFriendIcon] = useState<string>(); 
    if (!currUser) return;

    useEffect(() => {
        async function fetchIcon() {
            if (currUser && friend.icon !== "") {
              try {
                const url = await getUserIcon(friend.icon);
                // console.log("Found Icon URL: ", url);
                setFriendIcon(url);
              } catch (error) {
                console.error("Failed to fetch friend icon:", error);
                // Handle the error e.g., set a default icon or state
                const url = await getUserIcon("Icon/Default/Avatar.png");
                console.log("Used default Icon URL: ", url)
                setFriendIcon(url);
              }
            } else {
            const url = await getUserIcon("Icon/Default/Avatar.png");
            // console.log("Used default Icon URL: ", url)
            setFriendIcon(url);
          }
        }

        if (currUser) {
            fetchIcon();
        }
    }, [currUser, friend.uid,friend.icon]); // Depend on currUser and friend.uid
    

    const handleUserClick = async () => {
        setIsPressed(true);
        await updateFriend(friend);
        router.push("/FriendProfile2");
    };

    // Function to remove a friend
    const removeFriend = async (userUID: string, friendUID: string) => {
        const userRef = doc(firestore, 'Users', userUID);
        const friendRef = doc(firestore, 'Users', friendUID);

        try {
            if (currUser) {
                const updatedUser = { ...currUser };
                const friendIndex = updatedUser.friends.indexOf(friendUID);
                updatedUser.friends.splice(friendIndex, 1);
                updateCurrUser(updatedUser);
            }
            // Remove friendUid from user's friends list
            updateDoc(userRef, { friends: arrayRemove(friendUID) });

            if (friend) {
                const updatedFriend = { ...friend };
                const userIndex = updatedFriend.friends.indexOf(userUID);
                updatedFriend.friends.splice(userIndex, 1);
                updateFriend(updatedFriend);
            }
            // Remove userId from friend's friends list
            updateDoc(friendRef, { friends: arrayRemove(userUID) });

            console.log('Friend removed successfully');
        } catch (error) {
            console.error('Error removing friend:', error);
            throw error;
        }
        fetchData();
    };

    return (
        <Pressable
            onPress={() => handleUserClick()}
            onPressOut={() => setIsPressed(false)}
            p={3} mb={2}
            borderRadius="xl" borderWidth={1} borderColor="trueGray.50" shadow="3"
            bg={isPressed ? "trueGray.200" : "trueGray.50"} // Change background color on hover
        >
            <Row alignItems="center" space="sm">
                <Avatar size="md" source={{ uri: friendIcon}} />
                <Row justifyContent="space-between" alignItems="center" flex={1}>
                    <Column>
                        <Text color="trueGray.900" fontSize="lg" fontWeight="bold">{friend.name}</Text>
                    </Column>
                    <Spacer />
                    {currUser && < Button backgroundColor="#0EA5E9" _pressed={{opacity: 0.5}}  height={5} pt={0} pb={0} alignItems="center" onPress={() => removeFriend(currUser.uid, friend.uid)}>
                        <Text color="#FFF" fontSize="xs" fontWeight="bold">  Unfollow  </Text>
                    </Button>
                    }
                </Row>
            </Row>
        </Pressable>
    );
};

export default friendContainer;