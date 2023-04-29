Array = csvread('composedSignal.csv');
dt = mean(diff(Array(:,1)));% sampling period
Fs = 1/dt;
[S,F,T,P] = spectrogram(Array(:,2),300,280,200,Fs);
surf(T,F,10*log10(abs(P)),'EdgeColor','none');   
axis xy; axis tight; colormap(jet); view(0,90);
xlabel('Time (s)');
ylabel('Frequency (Hz)');