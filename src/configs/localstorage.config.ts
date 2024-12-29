const LocalStorageConfig = Object.freeze({
    userRoomLayout: {
        name: "airbnb-user-room-layout",
        values: Object.freeze({
            grid: "grid",
            table: "table"
        })
    },
    navigateAuth: {
        name: "isAuth",
        values: Object.freeze({
            true: "true",
            false: "false"
        })
    }
})

export default LocalStorageConfig;