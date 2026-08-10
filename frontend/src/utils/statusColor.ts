export const getStatusColor = (status: string) => {

    switch(status){

        case "Normal":
            return "bg-green-500";

        case "High":
            return "bg-red-500";

        case "Low":
            return "bg-yellow-500";

        default:
            return "bg-gray-500";
    }

}