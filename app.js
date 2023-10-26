const fs = require('fs')

const formatProcessList = (input)=> {
    const dum = []
    const lines = input.split('\r\n')
    let processes = []
    for(line of lines){
        const word = line.split(' ')
        for(let i = 1; i < word.length; i++){
            dum.push(word[i])
        }
    }
    for(let i = 0; i < dum.length/3; i++){
        let piece = {processId:dum[i], burstTime: parseInt(dum[i+dum.length/3]), arrivalTime: parseInt(dum[i+dum.length*2/3])}
        processes.push(piece)
    }
    return processes.sort((x, y)=> x.arrivalTime - y.arrivalTime) // sorts processes based on arrival time
}

const run = (processes) => {
    var currentTime, CPU
    const queue = []
    const logs = []
    let first = processes.shift()
    currentTime = first.arrivalTime // starts relative time to first arrival
    queue.push(first)

    while(1){ // passage of time

        if(!CPU){       //if there's nothing on CPU, drags process from queue
            CPU = queue.shift()
        }

        //check if another process has required CPU
        if(processes.length && processes[0].arrivalTime === currentTime){
            //if true, pushes to queue and sorts based on burstTime
            var arriven = processes.shift()
            queue.push(arriven)
            queue.sort((x, y) => x.burstTime - y.burstTime)
            if(arriven.burstTime < CPU.burstTime){
                // if new process burstTime is less than CPU's, swaps right away
                queue.shift()
                queue.push(CPU)
                queue.sort((x, y) => x.burstTime - y.burstTime)
                CPU = arriven
            }
        }

        //if current process has finished execution
        if(!CPU.burstTime){
            if(!queue.length) return logs
            CPU = queue.shift()
        }

        logs.push(CPU.processId)
        CPU.burstTime--
        currentTime++
    }
}

const getTimeline = (logs)=> {
    var finalStr = '[0]'
    for(let i = 0; i < logs.length; i++){
        if(logs[i] !== logs[i+1]) finalStr+= `---${logs[i]}---[${i+1}]`
    }
    return finalStr
}

const getIndividualResponseTime = (logs, listOfProcesses) => {
    const times = []
    const processes = []
    for(process of logs){
        if(!processes.includes(process)){
            processes.push(process)
        }
    }

    while(processes.length != 0){
        let indexes = []
        for(let i = 0; i < logs.length; i++){
            if(logs[i] == processes[0]) indexes.push(i)
        }
        let lastProcessOcurrence = indexes[indexes.length-1]
        let processArrivalTime

        for(p of listOfProcesses){
            if(p.processId === processes[0]) processArrivalTime = p.arrivalTime
        }

        let time = lastProcessOcurrence - processArrivalTime + 1
        let process = processes.shift()
        times.push({[process]: time})
    }

    return times
}   

const getIndividualWaitingTime = (logs, listOfProcesses) => {
    const times = []
    const processes = []
    for(process of logs){
        if(!processes.includes(process)){
            processes.push(process)
        }
    }

    while(processes.length != 0){
        let indexes = []
        for(let i = 0; i < logs.length; i++){
            if(logs[i] == processes[0]) indexes.push(i)
        }

        let lastProcessOcurrence = indexes[indexes.length-1]

        let time = 0
        for(let i = 0; i < logs.length; i++) if(logs[i] !== processes[0] && i <= lastProcessOcurrence) time++

        let processArrivalTime
        for(p of listOfProcesses){
            if(p.processId === processes[0]) processArrivalTime = p.arrivalTime
        }
        time = time - processArrivalTime
        let process = processes.shift()
        times.push({[process]: time})
    }

    return times
    //if not already past last ocurrence AND current process != process???
    //then increase one in waiting time
    //finally, decrease arrivalTime from it
}

const getAverageTimes = (waitingTimeArray, responseTimeArray) => {
    let sum1 = 0
    let sum2 = 0

    for(obj of waitingTimeArray){
        for(const key in obj){
            sum1 += obj[key] 
        }
    }

    for(obj of responseTimeArray){
        for(const key in obj){
            sum2 += obj[key]
        }
    }

    return [sum1/waitingTimeArray.length, sum2/responseTimeArray.length]
}

fs.readFile('1.txt', 'utf8', (err, data)=> {
    if(err) {
        console.log(err)
        return
    }

    let processes = formatProcessList(data)
    const newProcesses = [...processes]
    let logs = run(processes)


    const individualResponseTime = getIndividualResponseTime(logs, newProcesses)
    const individualWaitingTime = getIndividualWaitingTime(logs, newProcesses)
    const averageTimes = getAverageTimes(individualResponseTime, individualWaitingTime)
    const timeLine = getTimeline(logs)

    console.log('Tempos individuais de resposta: ', individualResponseTime)
    console.log('Tempos individuais de espera: ', individualWaitingTime)
    console.log('Tempos médios de resposta e de espera: ', averageTimes)
    console.log('Linha do tempo: ', timeLine)
    //console.log(logs)
})