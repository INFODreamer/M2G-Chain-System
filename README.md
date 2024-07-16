# M2G-Chain-System
This primarily describes how to build a distributed edge computing environment for an M2G-Chain, where multi-modal generative chains can be implemented.


# Deployment and Implementation Process in Real Scenarios

## 1. Deploying the MultiGen Pathfinding Model on MainServer and Storing Model Information

The MultiGen pathfinding model aims to predict a suitable model invocation path based on user input requirements, using known model information. It directs the main server to call models deployed on different edge servers in a specific sequence.

All parameters of MultiGen have been tuned and configured, so users can directly use it. The user input is the sequence of modalities they want to use, for example:

- Audio to Text -> Text to Text -> Text to Image -> Image to Video

The output generated is the sequence in which the main server calls the models on the edge servers, for example:

- `whisper (Server2) -> llama (Server1) -> sd2.1 (Server1) -> image2video (Server3)`

### Models Deployed for Real Scenario Testing:

#### Server 1
- **sd2.1** (Text to Image)
- **llama** (Text to Text)

#### Server 2
- **whisper** (Audio to Text)
- **sd2.1** (Text to Image)
- **Stable-Diffusion-Playground**

#### Server 3
- **sd2.1** (Text to Image)
- **Sound-Diffusion** (Text to Image)
- **image2video** (Image to Video)

## 2. MainServer Invoking Models on Edge Servers

Based on the path predicted by MultiGen, the models on the edge servers are called in sequence. At this time, each edge server runs a `receiving.py` file continuously, waiting for instructions from the MainServer.

The `sending.py` file running on the MainServer sends the corresponding CMD commands to the edge servers via their IP addresses and port numbers, instructing them to invoke the models.

#### File Transfer Method: scp
```bash
scp -P [Port] [File Path] [Username]@[Target Server IP]:[Target Path]
# Example:
scp -P 39614 /data/(servername)/image2video-synthesis-using-cINNs/results.mp4 (servername)@172.16.10.15:/data/(servername)/files
```
We have integrated the scp transfer command into the corresponding Python files for the models.

#### Password-Free Transfer
Set up password-free scp for servers that need to transfer files mutually:
```bash
# Generate SSH key pair
ssh-keygen -t rsa -C "key pass"

# Copy the public key to the target server to enable password-free login
ssh-copy-id -p 39614 (servername)@172.16.10.15
```
### Example of the Testing Process

- Model Invocation Sequence: `whisper (Server2) -> llama (Server1) -> sd2.1 (Server1) -> image2video (Server3)`

1. **Invoke the `whisper` Model**
   - MainServer transfers the MP3 file to Server2.
   - MainServer sends the command to invoke `whisper` to Server2 via `sending.py`.
   - Server2 receives the command via `receiving.py`, calls `whisper` to process the file, and sends the generated text file back to MainServer.

2. **Invoke the `llama` Model**
   - MainServer sends the command to invoke `llama` to Server1 via `sending.py`.
   - Server1 receives the command via `receiving.py`, calls `llama` to process the file, and sends the generated text file back to MainServer.

3. **Invoke the `sd2.1` Model**
   - MainServer sends the command to invoke `sd2.1` to Server1 via `sending.py`.
   - Server1 receives the command via `receiving.py`, calls `sd2.1` to process the file, and sends the generated image file back to MainServer.

4. **Invoke the `image2video` Model**
   - MainServer transfers the image file to Server3.
   - MainServer sends the command to invoke `image2video` to Server3 via `sending.py`.
   - Server3 receives the command via `receiving.py`, calls `image2video` to process the file, and sends the generated video file back to MainServer.

Finally, you can view the final generated result and the intermediate results in the corresponding path on the MainServer.
