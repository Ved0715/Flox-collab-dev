import { api } from '@/trpc/react';
import React from 'react'
import { useLocalStorage } from 'usehooks-ts'

const useProject = () => {
    const { data: projects } = api.project.getProjets.useQuery();
    const [projectId , setProjectId] =useLocalStorage("Flox-project","")
    const project = projects?.find(project => project.id === projectId )
    return {
        projects,
        project,
        projectId,
        setProjectId
    }
}

export default useProject