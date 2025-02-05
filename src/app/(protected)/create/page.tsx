'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import Image from 'next/image'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'


type FormInput = {
    repoUrl: string,
    projectName: string,
    githubToken?: string,
}
const CreatePage = () => {
    const { register, handleSubmit, reset} = useForm<FormInput>();
    const createProject = api.project.createProject.useMutation()
    const refetch = useFetch();

    function OnSubmit(data: FormInput){
        createProject.mutate({
            name: data.projectName,
            githubUrl: data.repoUrl,
            githubToken: data.githubToken
        },{
            onSuccess: () => {
                toast.success("Project created successfully")
                refetch()
                reset()
            },
            onError: () => {
                toast.success("Failed to create Project")
            }
        })
        return true
    }
  return (
    <div className='flex items-center justify-center gap-12 h-full'>
        <img src="/undraw_github.svg" alt="Undraw Github" className='h-56 w-auto' />
        <div>
            <div>
                <h1 className='font-semibold text-2xl'>
                    Link your Github Repository
                </h1>
                <p className='text-sm text-muted-foreground'>
                    Enter the url of your repositary to link it to Dianosys
                </p>
            </div>
            <div className="h-4"></div>
            <div>
                <form onSubmit={handleSubmit(OnSubmit)}>
                    <Input
                    {...register('projectName', {required:true})}
                    placeholder='Project Name'
                    required
                    />
                    <div className="h-2"></div>
                    <Input
                    {...register('repoUrl', {required:true})}
                    placeholder='Github URL'
                    type='url'
                    required
                    />
                    <div className="h-2"></div>
                    <Input
                    {...register('githubToken')}
                    placeholder='Github Tocken (Optional)'
                    />
                    <div className="h-4"></div>
                    <Button type='submit' disabled={createProject.isPending}>
                        Create Project
                    </Button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default CreatePage