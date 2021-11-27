import React, {FC, useEffect} from 'react'

type DevicePageProps = {
  deviceid: string
}

const Device:FC<DevicePageProps> = (props) => {

  return (
    <div>
      {props.deviceid}
    </div>
  )
}

export default Device;