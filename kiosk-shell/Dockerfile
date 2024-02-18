FROM ubuntu:18.04 AS base

ENV DEBIAN_FRONTEND=noninteractive

# cache apt-get update results
RUN apt-get update

# install and "prime" the SSH server
RUN apt-get install -qy openssh-server
RUN service ssh start

RUN groupadd --gid 1000 hello
RUN useradd --create-home -s /bin/bash -g hello -u 1000 hello
# @todo remove if not local?
RUN echo 'hello:world' | chpasswd

# authorize the built machine identity SSH key
COPY --from=tuisshkey /root/licheepi-nano/root_id_rsa.pub /home/hello/.ssh/authorized_keys
RUN chown -R hello:hello /home/hello/.ssh && chmod -R go-rwx /home/hello/.ssh && chsh -s /bin/bash

EXPOSE 22

CMD ["/usr/sbin/sshd","-D"]