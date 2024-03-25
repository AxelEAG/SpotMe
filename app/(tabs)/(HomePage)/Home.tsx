import React, { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import {
  NativeBaseProvider,
  Input,
  IconButton,
  Row,
  Flex,
  Box,
  Button,
  Text,
  Badge,
} from "native-base";
import {
  Image,
  ScrollView,
  ActivityIndicator,
  Button as RButton,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "@/Context/AuthContext";
import {
  IUser,
  getUsers,
  getCurrUser,
  updateUsers,
  removeFieldFromUsers,
  Gym,
} from "@/components/FirebaseUserFunctions";
import UserPreview from "../../../components/HomeComponents/UserContainer";
import Header from "../../../components/HomeComponents/Header";
import theme from "@/components/theme";
import updateUser from "@/components/storage";
import { doc, getDoc, GeoPoint, onSnapshot,updateDoc } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import * as Location from "expo-location";

import { GetUserLocation } from "@/components/GeolocationFunction";
import pointInPolygon from "point-in-polygon";
export default function HomeScreen() {
  const [gym, setGym] = useState<Gym>(); // State to store the gym
  const [gymName, setGymName] = useState<string>();
  const [user, setUser] = useState<IUser>(); // State to store the current user
  const [gymId, setGymId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<any>("");
  const [useFilters, setUseFilters] = useState<boolean>(false);
  const [users, setUsers] = useState<IUser[]>([]); // State to store users
  const [loading, setLoading] = useState<boolean>(false); // State to track loading state
  const { currUser, User } = useAuth();

  const [location, setLocation] = useState<number[]>([]);
  const bound = useRef<number[][]>([]); // State to store the gym boundary
  const [checkIn, setCheckIn] = useState<boolean>(false); // State to store the gym boundary
  const Day = new Date();
  const Today =
    Day.getFullYear() + "-" + (Day.getMonth() + 1) + "-" + Day.getDate();
  const today = new Date();
  if (!User) return;
  if (!currUser) return;

  // Initialize gym data
  useEffect(() => {
    const fetchGym = async () => {
      try {
        const user = await getCurrUser(User.uid);
        setUser(user);
        const History = user.checkInHistory;
        if (History && History.includes(Today)) {
          setCheckIn(true); 
        }
        const gymDocRef = doc(firestore, "Gyms", user.gymId);
        const userGym = (await getDoc(gymDocRef)).data() as Gym;

        userGym.bounding.forEach((point) => {
          bound.current.push([point.latitude, point.longitude]);
        });
        setGym(userGym);
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };
    if (User) {
      fetchGym();
      handleGetUsers();
      if (!gymId && !gymName) {
        console.log("Initialize gym: ", currUser.gymId, currUser.gym);
        setGymId(currUser.gymId);
        setGymName(currUser.gym);
        setFilters(currUser.filters);
      }
    }
  }, [currUser]);

  // Update gym when changed
  useEffect(() => {
    if (User) {
      const unsubscribe = onSnapshot(
        doc(firestore, "Users", User.uid),
        (snapshot) => {
          const updatedUser = snapshot.data() as IUser;
          const newGymId = updatedUser.gymId;
          const newGymName = updatedUser.gym;

          if (gymId && gymId !== newGymId) {
            console.log("Listened gym change: ", gymName, newGymName);
            setGymId(newGymId);
            setGymName(newGymName);
          }

          const newFilters = updatedUser.filters;
          if (filters && filters !== newFilters) {
            console.log("New filters added: ", newFilters);
            setFilters(filters);
          }
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [User, gymId, gymName, filters]);

  // Search users on gym when gym is changed/initialized
  useEffect(() => {
    if (gymId && gymName) {
      console.log("Retrieving users of gym", gymId, gymName);
      handleGetUsers();
    }
  }, [gymId, gymName]);

  // TODO: Display user preview when clicked
  const handlePreviewClick = (user: IUser) => {
    // Do something when user is clicked
    // Open Profile
  };

  // Get users from database from gym
  const handleGetUsers = async () => {
    /// await updateUser(currUser.uid); // Individual update for when needed
    // updateUsers(); // Uncomment when we want to use it to add fields
    setUsers([]);
    setLoading(true);
    const fetchedUsers = await getUsers(User.uid, gymId);
    setUsers(fetchedUsers);
    setLoading(false);
  };

  // Search users by name
  const handleSearchUsers = async () => {
    setUsers([]);
    setLoading(true);

    let fetchedUsers: IUser[];
    if (searchTerm == "") {
      //By default search users by gym
      fetchedUsers = await getUsers(User.uid, gymId);
      console.log("Fetched gym users...");
    } else if (searchTerm == "all") {
      // Testing keyword to show all users
      fetchedUsers = await getUsers(User.uid);
      console.log("Fetched all users...");
    } else if (searchTerm == "test") {
      // Testing keyword to test filters
      // filters: [["sex", "==", "male"], ["gymExperience", ">=", "1"]]);
      if (filters) {
        fetchedUsers = await getUsers(User.uid, "", filters);
        console.log(
          "Fetched filtered users with the following filters: ",
          filters
        );
      } else {
        fetchedUsers = await getUsers(User.uid, gymId);
        console.log("Couldn't filter users with following filters: ", filters);
      }
    } else if (searchTerm == "test2") { // Testing with gyms
      if (filters){
        fetchedUsers = await getUsers(User.uid, "", filters);
        console.log("Fetched filtered users with the following filters: ", filters);
      } else {
        fetchedUsers = await getUsers(User.uid, gymId);
        console.log("Couldn't filter users with following filters: ", filters);
      }
    } else { // TODO: Search by users (search term should be user name)
      fetchedUsers = await getUsers(User.uid, gymId);
      console.log("Fetched users with name ", searchTerm);
    }

    setUsers(fetchedUsers);
    setLoading(false);
  };
  const AddDate = async () => {
    if (user) {
      try {
        const userRef = doc(firestore, "Users", User.uid);
        await updateDoc(userRef, {
          checkInHistory: [...user.checkInHistory, Today],
        });
        setCheckIn(true);
      } catch (error) {
        console.error("Error updating bio: ", error);
      }
    }
  };

  // Function to handle filter changes
  const handleFiltersApplied = (newFilters: any) => {
    // Handle the selected filters

    console.log("Selected Filters: ", filters);
    setFilters(newFilters);
  };
  const handleCheckIn = async () => {
    const location = await GetUserLocation();
    if (checkIn) {
      alert("You have already checked in today");
      return;
    } else {
      if (location) {
        setLocation(location);
        if (pointInPolygon(location, bound.current)) {
          AddDate();
          alert(
            "Wooho seems like you at the location and check in is successful"
          );
        } else {
          alert(
            "You are not at the gym location, please check in at the gym location"
          );
        }
      } else {
        alert("Please enable location services to check in");
      }
    }
  };
  return (
    <NativeBaseProvider theme={theme}>
      <SafeAreaView
        style={{ backgroundColor: "#FFF", flex: 1, padding: 15, paddingTop: 2 }}
      >
        <Header GymName={gymName ? gymName : ""} />
        <Input
          InputLeftElement={
            <IconButton
              size="xs"
              onPress={handleSearchUsers}
              icon={<FontAwesome name="search" size={24} color="#075985" />}
            />
          }
          placeholder="Spot someone in this gym"
          bgColor="trueGray.100"
          onChangeText={setSearchTerm}
          borderRadius="md"
          borderWidth={1}
        />
        <Row mb={1}>
          <IconButton
            size="xs"
            onPress={() => router.push("/Filter")}
            icon={<Ionicons name="filter" size={24} color="#075985" />}
          />
          <IconButton
            size="xs"
            onPress={() => router.push("/Friends")}
            icon={
              <FontAwesome5 name="user-friends" size={24} color="#075985" />
            }
          />
        </Row>
        <ScrollView>
          {users.map((user) => (
            <UserPreview friend={user} key={user.uid} />
          ))}
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </ScrollView>
        <Button
          size={"lg"}
          borderRadius={30}
          position={"absolute"}
          top={675}
          left={280}
          background={"#0284C7"}
          onPress={handleCheckIn}
        >
          Check In
        </Button>
      </SafeAreaView>
    </NativeBaseProvider>
  );
}
//insde the gym: 42.352057232511406, -71.11682641206473
// outside the gym: 42.35249135900813, -71.11565509642959
//42.35193439884672, -71.11673198835226
//42.352164385569864, -71.11695979401712
