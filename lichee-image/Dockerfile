# use this to iterate on changes to config without rebuilding the entire
# image from scratch; ensure to clean the right stamps/folders to correctly
# trigger rebuild with Buildroot

ARG BASE_IMAGE=tui-base
ARG BASE_VERSION=latest

FROM $BASE_IMAGE:$BASE_VERSION AS local

# copy newest version of local files
WORKDIR /root/licheepi-nano
COPY board/ board/
COPY configs/ configs/
COPY \
    Config.in \
    external.desc \
    external.mk \
    ./

# reset Buildroot config and ensure rebuild is triggered
WORKDIR /root/buildroot
RUN BR2_EXTERNAL=/root/licheepi-nano make licheepi_nano_defconfig
RUN cd output/build/uboot-v2021.01-f1c100s-4/ && rm .stamp_built .stamp_*installed
RUN cd output/build/host-uboot-tools-2021.07/ && rm .stamp_built .stamp_*installed
RUN cd output/build/linux-custom/ && rm .stamp_dotconfig .stamp_configured .stamp_built .stamp_*installed
RUN cd output/build/linux-firmware-20221214/ && rm .stamp_built .stamp_*installed

# re-run build
RUN make

# expose built image files in standalone root folder
FROM scratch AS localout
COPY --from=local /root/buildroot/output/images/ .
