"""Controller program to manage the benchmark."""
from controller import Supervisor
import math
import os


def parseSecondsIntoReadableTime(seconds):
    """Generate a string based on seconds having the format "m:s:cs"."""
    minutes = seconds / 60
    absoluteMinutes = int(minutes)
    seconds = (minutes - absoluteMinutes) * 60
    absoluteSeconds = int(seconds)
    m = str(absoluteMinutes)
    if absoluteMinutes <= 9:
        m = '0' + m
    s = str(absoluteSeconds)
    if absoluteSeconds <= 9:
        s = '0' + s
    cs = str(int((seconds - absoluteSeconds) * 100))
    return m + ':' + s + ':' + cs


robot = Supervisor()

timestep = int(robot.getBasicTimeStep())

targetNode = robot.getFromDef("TARGET")
targetPosition = targetNode.getPosition()
targetPosition[2] = 0.0350

targetOrientation = targetNode.getOrientation()

boxNode = robot.getFromDef("PRODUCT")

time = 0
distance = 0
previousDistance = 0
boxPicked = False
notMovingStepCount = 0
while robot.step(timestep) != -1:
    position = boxNode.getPosition()
    distance = round(math.sqrt(math.pow(targetPosition[0] - position[0], 2)
                               + math.pow(targetPosition[1] - position[1], 2)), 4)
    time = robot.getTime()
    robot.wwiSendText("update: " + str(time) + " {0:.4f}".format(distance))
    if boxPicked and distance < 0.036 and position[2] < 0.156:
        if distance == previousDistance:
            notMovingStepCount += 1
            if notMovingStepCount > 10:
                break
        else:
            notMovingStepCount = 0
        previousDistance = distance
    elif not boxPicked and position[2] > 0.21:
        boxPicked = True

robot.wwiSendText(f"stop_{parseSecondsIntoReadableTime(time)}")

# Performance output used by automated CI script
CI = os.environ.get("CI")
if CI:
    print(f"performance:{time}")
else:
    print(f"Final time: {parseSecondsIntoReadableTime(time)}")

robot.simulationSetMode(Supervisor.SIMULATION_MODE_PAUSE)
