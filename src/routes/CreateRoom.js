import React from "react";
import { v4 } from "uuid";
import { useHistory } from "react-router";
const CreateRoom = (props) => {
    const history = useHistory()
    function create() {
        const id = v4();
        history.push(`/room/${id}`);
    }

    return (
        <button onClick={create}>Create room</button>
        
    );
};

export default CreateRoom;
