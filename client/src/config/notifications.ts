import {store as notificationStore} from "react-notifications-component";

type Type = 'success' | 'danger' | 'info' | 'default' | 'warning' | undefined;

export const addNotification = (title: string, message: string, type?: Type) => {
    notificationStore.addNotification({
        title,
        message,
        type,
        insert: "top",
        container: "bottom-right",
        animationIn: ["animate__animated", "animate__flipInX"],
        animationOut: ["animate__animation", "animate__flipOutX"],
        dismiss: {
            duration: 5000,
            onScreen: true,
            pauseOnHover: true
        },
        slidingExit: {
            duration: 200
        }
    });
};
