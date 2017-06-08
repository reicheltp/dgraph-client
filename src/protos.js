// @noflow
import grpc from 'grpc'
import path from 'path'

const p1 = grpc.load(path.join(__dirname, '/../protos/task.proto'))
const p2 = grpc.load(path.join(__dirname, '/../protos/types.proto'))

export default {...p1.protos, ...p2.protos}
