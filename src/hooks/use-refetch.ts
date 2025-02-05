import { useQueryClient } from "@tanstack/react-query"

const useFetch = () => {
    const queryClient = useQueryClient();
    return async () => {
        await queryClient.refetchQueries({
            type:'active'
        })
    }
}

export default useFetch