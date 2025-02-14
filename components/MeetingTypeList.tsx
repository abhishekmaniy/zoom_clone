'use client'

import { useToast } from '@/hooks/use-toast'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import HomeCard from './HomeCard'
import MeetingModel from './MeetingModel'
import { Textarea } from './ui/textarea'

const MeetingTypeList = () => {
  const router = useRouter()
  const [meettingState, setMeettingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >()
  const { user } = useUser()
  const client = useStreamVideoClient()
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: '',
    link: ''
  })
  const [callDetails, setCallDetails] = useState<Call>()
  const { toast } = useToast()

  const createMeeting = async () => {
    if (!user || !client) return

    try {
      if (!values.dateTime) {
        toast({
          title: 'Please enter date & time'
        })
        return
      }

      const id = crypto.randomUUID()
      const call = client.call('default', id)

      if (!call) throw new Error('Failed to create call')

      const startAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString()

      const description = values.description || 'Instant Meeting'

      await call.getOrCreate({
        data: {
          starts_at: startAt,
          custom: {
            description
          }
        }
      })

      setCallDetails(call)

      if (!values.description) {
        router.push(`/meeting/${call.id}`)
      }
      toast({
        title: 'Meeting Created'
      })
    } catch (error) {
      console.log(error)
      toast({
        title: 'Failed to create meeting'
      })
    }
  }

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`

  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
      <HomeCard
        img='/icons/add-meeting.svg'
        title='New Meeting'
        description='Start an instant meeting'
        handleClick={() => setMeettingState('isInstantMeeting')}
        className='bg-orange-1'
      />
      <HomeCard
        img='/icons/schedule.svg'
        title='Schedule Meeting'
        description='Plan your meeting'
        handleClick={() => setMeettingState('isScheduleMeeting')}
        className='bg-blue-1'
      />
      <HomeCard
        img='/icons/recordings.svg'
        title='View Recordings'
        description='Check out your recordings'
        handleClick={() => router.push('/recordings')}
        className='bg-purple-1'
      />
      <HomeCard
        img='/icons/join-meeting.svg'
        title='Join Meeting'
        description='via invitation link'
        handleClick={() => setMeettingState('isJoiningMeeting')}
        className='bg-yellow-1'
      />

      {!callDetails ? (
        <MeetingModel
          isOpen={meettingState === 'isScheduleMeeting'}
          onClose={() => setMeettingState(undefined)}
          title='Start a Instant Meeting'
          handleClick={createMeeting}
        >
          <div className='flex flex-col gap-2.5'>
            <label
              htmlFor=''
              className='text-base text-normal leading-[22px] text-sky-2 '
            >
              Add a description
            </label>
            <Textarea
              className='border-none bg-dark-3 focus-visible:ring-0 focus-visible-ring-offset-0 '
              onChange={e => {
                setValues({ ...values, description: e.target.value })
              }}
            />
          </div>
          <div className='flex w-full flex-col gap-2.5'>
            <label
              htmlFor=''
              className='text-base text-normal leading-[22px] text-sky-2 '
            >
              Select Date & Time
              <ReactDatePicker
                selected={values.dateTime}
                onChange={date => setValues({ ...values, dateTime: date! })}
                showTimeSelect
                timeFormat='HH:mm'
                timeIntervals={15}
                timeCaption='time'
                dateFormat='MMMM d yyyy h:mm aa'
                className='w-full rounded bg-dark-3 p-2 focus:outline-none'
              />
            </label>
          </div>
        </MeetingModel>
      ) : (
        <MeetingModel
          isOpen={meettingState === 'isScheduleMeeting'}
          onClose={() => setMeettingState(undefined)}
          title='Meeting Created'
          className='text-center'
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink)
            toast({ title: 'Link Copied' })
          }}
          image='icons/checked.svg'
          buttonIcon='/icons/copy.svg'
          buttonText='Copy Meetting Link'
        />
      )}

      <MeetingModel
        isOpen={meettingState === 'isInstantMeeting'}
        onClose={() => setMeettingState(undefined)}
        title='Start a Instant Meeting'
        className='text-center'
        buttonText='Start Meeting'
        handleClick={createMeeting}
      />
    </section>
  )
}

export default MeetingTypeList
